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
  { value: "lecturer", label: "Lecturer" },
  { value: "support_staff", label: "Support Staff" },
];

export const roleMap: Record<string, number> = {
  facility_attendant: 2,
  maintenance: 3,
  security: 4,
  front_desk: 5,
  driver: 6,
  cafeteria: 7,
  horticulture: 8,
  admissions: 9,
  hr: 10,
  student_affairs: 11,
  lecturer: 12,
  support_staff: 13,
};

export function getRoleIds(selectedRoles: string[]): number[] {
  return selectedRoles
    .map((role) => roleMap[role])
    .filter((id): id is number => id !== undefined); // filter out invalids
}
