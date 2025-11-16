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
  { value: "exam_and_records", label: "Exams and Records" },
  { value: "museum", label: "Museum" },
  { value: "library", label: "Library" },
  { value: "purchasing", label: "Purchasing" },
  { value: "dvc_office", label: "DVC's Office" },
  {
    value: "community_relations_development",
    label: "Community Relations and Development",
  },
  { value: "professional_education", label: "Professional Education" },
  { value: "nollywood_studies_centre", label: "Nollywood Studies Centre" },
  { value: "academic_education", label: "Academic Education" },
  { value: "philosophy", label: "Philosophy" },
  { value: "ethics_and_anthropology", label: "Ethics and anthropology" },
  { value: "general_studies", label: "General studies" },
  { value: "english", label: "English" },
  { value: "mass_communication", label: "Mass Communication" },
  {
    value: "information_science_media_studies",
    label: "Information Science and Media Studies",
  },
  { value: "film_multimedia_studies", label: "Film and Multimedia studies" },
  { value: "business_administration", label: "Business Administration" },
  { value: "economics", label: "Economics" },
  { value: "accounting", label: "Accounting" },
  { value: "finance", label: "Finance" },
  { value: "mechanical_engineering", label: "Mechanical Engineering" },
  {
    value: "electrical_electronics_engineering",
    label: "Electrical and Electronics Engineering",
  },
  { value: "computer_science", label: "Computer Science" },
  { value: "basic_sciences", label: "Basic Sciences" },
  { value: "media", label: "Media" },
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
  exam_and_records: 24,
  museum: 25,
  library: 26,
  purchasing: 27,
  dvc_office: 28,
  community_relations_development: 29,
  professional_education: 30,
  nollywood_studies_centre: 31,
  academic_education: 32,

  // IOH Department
  philosophy: 33,
  ethics_and_anthropology: 34,
  general_studies: 35,
  english: 36,

  // SMC Department
  mass_communication: 37,
  information_science_media_studies: 38,
  film_multimedia_studies: 39,

  // SMSS Department
  business_administration: 40,
  economics: 41,
  accounting: 42,
  finance: 43,

  // SST Department
  mechanical_engineering: 44,
  electrical_electronics_engineering: 45,
  computer_science: 46,
  basic_sciences: 47,
  media: 48,
};

export function getRoleIds(selectedRoles: string[]): number[] {
  return selectedRoles
    .map((role) => roleMap[role])
    .filter((id): id is number => id !== undefined);
}
