export type MetricCard = {
  label: string;
  value: string;
  delta?: string;
  hint: string;
};

export const metricCards: MetricCard[] = [
  {
    label: "Active Tenants",
    value: "24",
    delta: "+ 3",
    hint: "21 this month",
  },
  {
    label: "Total Users",
    value: "4,892",
    hint: "Registered users",
  },
  {
    label: "Active Bookings",
    value: "12,345",
    hint: "Bookings this month",
  },
  {
    label: "Revenue",
    value: "EUR 78,902",
    delta: "+ 5.4%",
    hint: "this month",
  },
];

export const revenueSparklineData = [
  { value: 64 },
  { value: 86 },
  { value: 83 },
  { value: 76 },
  { value: 62 },
  { value: 73 },
  { value: 67 },
  { value: 60 },
  { value: 70 },
  { value: 78 },
  { value: 92 },
  { value: 118 },
];

export const revenueBookingsData = [
  { month: "Aug", revenue: 210, bookings: 390, reversed: 340 },
  { month: "Sep", revenue: 320, bookings: 570, reversed: 410 },
  { month: "Sep", revenue: 450, bookings: 760, reversed: 560 },
  { month: "Oct", revenue: 760, bookings: 910, reversed: 710 },
  { month: "Nov", revenue: 740, bookings: 1030, reversed: 780 },
  { month: "Dec", revenue: 840, bookings: 1090, reversed: 870 },
  { month: "Jan", revenue: 1130, bookings: 1290, reversed: 940 },
  { month: "Jan", revenue: 1500, bookings: 1500, reversed: 1020 },
];

export type AuditLogItem = {
  id: string;
  actor: string;
  action: string;
  time: string;
  subtitle?: string;
};

export const auditLogsPrimary: AuditLogItem[] = [
  { id: "1", actor: "Karl Thompson", action: "SERVICE-UPDATED", time: "10 mins ago" },
  { id: "2", actor: "Sophie Carter", action: "SERVICE-CREATED", time: "1 hr ago" },
  { id: "3", actor: "Adam Wright", action: "TENANT-CREATED", time: "2 hrs ago" },
  { id: "4", actor: "Patricia Gomez", action: "USER-CREATED", time: "7 hrs ago" },
  { id: "5", actor: "Daniel Rovira", action: "SERVICE-UPDATED", time: "9h ago" },
];

export const auditLogsSecondary: AuditLogItem[] = [
  {
    id: "6",
    actor: "Karl Thompson",
    action: "SERVICE-UPDATED",
    time: "10 mins ago",
    subtitle: "Carolie Iberia profile.com",
  },
  {
    id: "7",
    actor: "Sophie Carter",
    action: "SERVICE-CREATED",
    time: "1 hr ago",
    subtitle: "Samp creatorweblog.in",
  },
  {
    id: "8",
    actor: "Daniel Rovira",
    action: "USER-CREATED",
    time: "9 h ago",
    subtitle: "Agent maker@origin.com",
  },
];

export type TenantRow = {
  id: string;
  tenantName: string;
  tenantDomain: string;
  tenantBadge: string;
  tenantColor: string;
  adminName: string;
  adminEmail: string;
  users: string;
  bookings: string;
  status: "Active" | "Inactive";
};

export const tenantRows: TenantRow[] = [
  {
    id: "tenant-1",
    tenantName: "Haircut Station",
    tenantDomain: "Bernri saloni wegox.com",
    tenantBadge: "HS",
    tenantColor: "bg-amber-100 text-amber-700",
    adminName: "Karl Thompson",
    adminEmail: "Carolei @persei profile.com",
    users: "12k",
    bookings: "156",
    status: "Active",
  },
  {
    id: "tenant-2",
    tenantName: "Beauty Salon Paris",
    tenantDomain: "Paris fit's wegox.com",
    tenantBadge: "BP",
    tenantColor: "bg-stone-200 text-stone-700",
    adminName: "Sophie Carter",
    adminEmail: "roseannette@asegarkri.j",
    users: "6",
    bookings: "138",
    status: "Active",
  },
  {
    id: "tenant-3",
    tenantName: "YogaLife Studio",
    tenantDomain: "Ariane fit@wegox.com",
    tenantBadge: "YS",
    tenantColor: "bg-cyan-100 text-cyan-700",
    adminName: "aclam@fivevlogatt.com",
    adminEmail: "ghon wrns.wegoxprot.com",
    users: "11",
    bookings: "126",
    status: "Active",
  },
  {
    id: "tenant-4",
    tenantName: "DentalCare Clinic",
    tenantDomain: "Arante therapy 2 seat.com",
    tenantBadge: "DC",
    tenantColor: "bg-slate-200 text-slate-700",
    adminName: "Susan Moleta",
    adminEmail: "sowery.oo@rhxwojzn.com",
    users: "8",
    bookings: "108",
    status: "Active",
  },
  {
    id: "tenant-5",
    tenantName: "Wellness Spa & Fitness",
    tenantDomain: "Rashi cosmarnasign.com",
    tenantBadge: "WS",
    tenantColor: "bg-orange-100 text-orange-700",
    adminName: "Josh Adams",
    adminEmail: "pudreho hitespace.com",
    users: "15",
    bookings: "90",
    status: "Inactive",
  },
];
