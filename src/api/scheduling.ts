// Comprehensive scheduling API functions
import { supabase } from '@/integrations/supabase/client';
import type { 
  Client, 
  Appointment, 
  RecurringAppointment, 
  WaitlistEntry, 
  BlockedTime, 
  AvailabilityRule,
  ServiceBuffer,
  ClientPreferences,
  BookingRequest,
  ReschedulingRequest,
  AvailabilityQuery,
  TimeSlot,
  AppointmentWithRelations
} from '@/types/scheduling';

// Client Management
export async function getClients(studioId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('studio_id', studioId)
    .order('first_name');
  
  if (error) throw error;
  return (data || []) as Client[];
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();
  
  if (error) throw error;
  return data as Client;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Appointment Management
export async function getAppointments(
  studioId: string, 
  startDate: string, 
  endDate: string
): Promise<AppointmentWithRelations[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      team_member:team_members(id, first_name, last_name, calendar_color),
      service:services(id, name, duration, price),
      location:locations(id, name, address)
    `)
    .eq('studio_id', studioId)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .order('appointment_date')
    .order('start_time');
  
  if (error) throw error;
  return (data || []) as AppointmentWithRelations[];
}

export async function createAppointment(appointment: BookingRequest & { studio_id: string }): Promise<Appointment> {
  // Calculate end time based on service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration')
    .eq('id', appointment.service_id)
    .single();
  
  if (!service) throw new Error('Service not found');
  
  const startTime = new Date(`2000-01-01T${appointment.start_time}`);
  const endTime = new Date(startTime.getTime() + service.duration * 60000);
  const endTimeStr = endTime.toTimeString().slice(0, 5);
  
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointment,
      end_time: endTimeStr,
      status: 'scheduled',
      payment_status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function rescheduleAppointment(request: ReschedulingRequest): Promise<Appointment> {
  // Get original appointment
  const { data: original, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', request.appointment_id)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Calculate new end time
  const { data: service } = await supabase
    .from('services')
    .select('duration')
    .eq('id', original.service_id)
    .single();
  
  if (!service) throw new Error('Service not found');
  
  const startTime = new Date(`2000-01-01T${request.new_start_time}`);
  const endTime = new Date(startTime.getTime() + service.duration * 60000);
  const endTimeStr = endTime.toTimeString().slice(0, 5);
  
  // Update appointment
  const { data, error } = await supabase
    .from('appointments')
    .update({
      appointment_date: request.new_date,
      start_time: request.new_start_time,
      end_time: endTimeStr,
      team_member_id: request.new_team_member_id || original.team_member_id,
      location_id: request.new_location_id || original.location_id,
      status: 'rescheduled'
    })
    .eq('id', request.appointment_id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Log the change
  await supabase
    .from('appointment_history')
    .insert({
      appointment_id: request.appointment_id,
      changed_by: (await supabase.auth.getUser()).data.user?.id || '',
      change_type: 'rescheduled',
      old_values: {
        appointment_date: original.appointment_date,
        start_time: original.start_time,
        end_time: original.end_time
      },
      new_values: {
        appointment_date: request.new_date,
        start_time: request.new_start_time,
        end_time: endTimeStr
      },
      notes: request.reason
    });
  
  return data;
}

export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Log the cancellation
  await supabase
    .from('appointment_history')
    .insert({
      appointment_id: id,
      changed_by: (await supabase.auth.getUser()).data.user?.id || '',
      change_type: 'cancelled',
      notes: reason
    });
  
  return data;
}

// Availability Management
export async function getAvailableTimeSlots(query: AvailabilityQuery): Promise<TimeSlot[]> {
  // This would implement complex availability calculation
  // For now, return sample data
  const slots: TimeSlot[] = [];
  
  // Get team member availability rules
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('studio_id', query.studio_id)
    .eq('rule_type', 'working_hours');
  
  // Get existing appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('studio_id', query.studio_id)
    .gte('appointment_date', query.start_date)
    .lte('appointment_date', query.end_date)
    .in('status', ['scheduled', 'confirmed', 'arrived', 'in_progress']);
  
  // Get blocked time
  const { data: blockedTimes } = await supabase
    .from('blocked_time')
    .select('*')
    .eq('studio_id', query.studio_id)
    .gte('start_date', query.start_date)
    .lte('end_date', query.end_date);
  
  // TODO: Implement sophisticated availability calculation
  // This would calculate available slots based on:
  // - Working hours
  // - Existing appointments
  // - Blocked time
  // - Service duration
  // - Buffer times
  
  return slots;
}

// Waitlist Management
export async function getWaitlist(studioId: string): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from('waitlist')
    .select(`
      *,
      client:clients(*),
      service:services(*),
      location:locations(*),
      preferred_team_member:team_members(*)
    `)
    .eq('studio_id', studioId)
    .eq('is_active', true)
    .order('priority_score', { ascending: false })
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at'>): Promise<WaitlistEntry> {
  const { data, error } = await supabase
    .from('waitlist')
    .insert(entry)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Blocked Time Management
export async function getBlockedTime(
  studioId: string,
  startDate: string,
  endDate: string
): Promise<BlockedTime[]> {
  const { data, error } = await supabase
    .from('blocked_time')
    .select('*')
    .eq('studio_id', studioId)
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .order('start_date')
    .order('start_time');
  
  if (error) throw error;
  return data || [];
}

export async function createBlockedTime(block: Omit<BlockedTime, 'id' | 'created_at' | 'updated_at'>): Promise<BlockedTime> {
  const { data, error } = await supabase
    .from('blocked_time')
    .insert(block)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Service Buffer Management
export async function getServiceBuffers(studioId: string): Promise<ServiceBuffer[]> {
  const { data, error } = await supabase
    .from('service_buffers')
    .select(`
      *,
      service:services!inner(studio_id)
    `)
    .eq('service.studio_id', studioId);
  
  if (error) throw error;
  return data || [];
}

export async function updateServiceBuffer(
  serviceId: string, 
  buffer: Partial<ServiceBuffer>
): Promise<ServiceBuffer> {
  const { data, error } = await supabase
    .from('service_buffers')
    .upsert({ service_id: serviceId, ...buffer })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Client Preferences
export async function getClientPreferences(clientId: string): Promise<ClientPreferences | null> {
  const { data, error } = await supabase
    .from('client_preferences')
    .select('*')
    .eq('client_id', clientId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateClientPreferences(
  clientId: string,
  preferences: Partial<ClientPreferences>
): Promise<ClientPreferences> {
  const { data, error } = await supabase
    .from('client_preferences')
    .upsert({ client_id: clientId, ...preferences })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}