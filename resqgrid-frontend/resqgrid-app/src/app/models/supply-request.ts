// ============================================================
// ResQGrid Supply Request Models
// ============================================================


// This interface represents the data that
// Camp Worker sends to Spring Boot when
// creating a new supply request.
export interface SupplyRequestCreateRequest {

  // Camp identifier.
  campId: string;

  // Number of people affected.
  peopleAffected: number;

  // Required water quantity.
  waterQuantity: number;

  // Required food quantity.
  foodQuantity: number;

  // Required medicine quantity.
  medicineQuantity: number;

  // Required blanket quantity.
  blanketQuantity: number;

  // Emergency priority.
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
}


// This interface represents the data that
// Spring Boot sends back to Angular.
//
// It contains everything from the create request
// plus the database-generated ID and current status.
export interface SupplyRequestResponse {

  // Database-generated request ID.
  id: number;

  // Camp identifier.
  campId: string;

  // Number of people affected.
  peopleAffected: number;

  // Required water quantity.
  waterQuantity: number;

  // Required food quantity.
  foodQuantity: number;

  // Required medicine quantity.
  medicineQuantity: number;

  // Required blanket quantity.
  blanketQuantity: number;

  // Emergency priority.
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';

  // Current request status.
  status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED';
}