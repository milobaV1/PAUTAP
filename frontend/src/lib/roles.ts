export const roles = [
  { value: "facility_attendant", label: "Facility Attendant" },
  { value: "maintenance", label: "Maintenance" },
  { value: "security", label: "Security" },
  { value: "front_desk", label: "Front Desk" },
  { value: "driver", label: "Driver" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "horticulture", label: "Horticulture" },
  { value: "admissions", label: "Admissions" },
  { value: "hr", label: "HR" },
  { value: "student_affairs", label: "Student Affairs" },
  { value: "pau_comms", label: "PAU Comms" },
  { value: "bursary", label: "Bursary" },
  { value: "registry", label: "Registry" },
  { value: "pau_press", label: "PAU Press" },
  { value: "physical_planning", label: "Physical Planning" },
  { value: "audit", label: "Audit" },
  { value: "ict", label: "ICT" },
  {
    value: "academic_programmes_marketing",
    label: "Academic Programmes Marketing",
  },
  { value: "alumni", label: "Alumni" },
  { value: "careers", label: "Careers" },
  { value: "faculty", label: "Faculty" },
  { value: "support_staff", label: "Support Staff" },
];

export const roleMap: Record<string, number> = {
  // Group 1
  facility_attendant: 2,
  maintenance: 3,

  // Group 2
  security: 4,
  front_desk: 5,
  driver: 6,

  // Group 3
  cafeteria: 7,
  horticulture: 8,

  // Group 4 (extended list)
  admissions: 9,
  hr: 10,
  student_affairs: 11,
  pau_comms: 12,
  bursary: 13,
  registry: 14,
  pau_press: 15,
  physical_planning: 16,
  audit: 17,
  ict: 18,
  academic_programmes_marketing: 19,
  alumni: 20,
  careers: 21,

  // Group 5 (faculty members)
  faculty: 22,

  // Group 6 (support staff)
  support_staff: 23,
};

export function getRoleIds(selectedRoles: string[]): number[] {
  return selectedRoles
    .map((role) => roleMap[role])
    .filter((id): id is number => id !== undefined);
}
