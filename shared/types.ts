export enum UserRole {
  HOD = 'HOD',
  COORDINATOR = 'COORDINATOR',
  FACULTY = 'FACULTY'
}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskCategory {
  ACADEMIC = 'Academic',
  DOCUMENTATION = 'Documentation',
  EXAMINATION = 'Examination',
  LABORATORY = 'Laboratory',
  ADMINISTRATIVE = 'Administrative',
  EVENTS = 'Events',
  RESEARCH = 'Research',
  MEETINGS = 'Meetings',
  OTHER = 'Other'
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  CANCELLED = 'CANCELLED'
}

export enum RequestCategory {
  WORKLOAD_ADJUSTMENT = 'Workload Adjustment',
  LAB_RESOURCES = 'Laboratory Resources',
  SOFTWARE = 'Software Requirements',
  EQUIPMENT = 'Equipment',
  TEACHING_MATERIALS = 'Teaching Materials',
  INFRASTRUCTURE = 'Infrastructure',
  ACADEMIC_SUGGESTIONS = 'Academic Suggestions',
  DEADLINE_EXTENSION = 'Deadline Extension',
  GENERAL_FEEDBACK = 'General Feedback',
  OTHER = 'Other'
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FORWARDED_TO_HOD = 'FORWARDED_TO_HOD',
  RESOLVED = 'RESOLVED'
}
