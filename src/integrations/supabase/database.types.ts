
export type Tables = {
  employees: {
    id: string;
    name: string;
    email: string;
    password?: string;
    is_admin: boolean;
    joined_at: string;
  };
  time_records: {
    id: string;
    employee_id: string;
    clock_in_time: string;
    clock_out_time?: string;
    location: string;
    total_work_duration: number;
    break_entries: any[];
  };
  invitations: {
    id: string;
    email: string;
    name: string;
    is_admin: boolean;
    created_at: string;
    token: string;
  };
};
