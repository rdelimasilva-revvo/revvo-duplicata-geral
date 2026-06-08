export interface Database {
  public: {
    Tables: {
      rules: {
        Row: {
          id: number
          created_at: string
          name: string | null
          description: string | null
          rule_type_id: number | null
          company_code: string[] | null
          days_since_creation: number | null
          value_ini: number | null
          value_end: number | null
          days_until_due_date_ini: number | null
          days_until_due_date_end: number | null
          active: boolean | null
          asset_type_id: number | null
          company_id: number | null
          bkpg_channel_id: number | null
          creator: string | null
          updated_at: string | null
          asset_origin_id: number | null
          supplier: string[] | null,
          customer: string[] | null,
          certf_digital: boolean | null
          output_channel_id: number | null
          bank_id: number[] | null
          partner_type: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          name?: string | null
          description?: string | null
          rule_type_id?: number | null
          company_code?: string[] | null
          days_since_creation?: number | null
          value_ini?: number | null
          value_end?: number | null
          days_until_due_date_ini?: number | null
          days_until_due_date_end?: number | null
          active?: boolean | null
          asset_type_id?: number | null
          company_id?: number | null
          bkpg_channel_id?: number | null
          creator?: string | null
          updated_at?: string | null
          asset_origin_id?: number | null
          supplier?: string[] | null,
          customer?: string[] | null,
          certf_digital?: boolean | null
          output_channel_id?: number | null
          bank_id?: number[] | null
          partner_type?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string | null
          description?: string | null
          rule_type_id?: number | null
          company_code?: string[] | null
          days_since_creation?: number | null
          value_ini?: number | null
          value_end?: number | null
          days_until_due_date_ini?: number | null
          days_until_due_date_end?: number | null
          active?: boolean | null
          asset_type_id?: number | null
          company_id?: number | null
          bkpg_channel_id?: number | null
          creator?: string | null
          updated_at?: string | null
          asset_origin_id?: number | null
          supplier?: string[] | null,
          customer?: string[] | null,
          certf_digital?: boolean | null
          output_channel_id?: number | null
          bank_id?: number[] | null
          partner_type?: number | null
        }
      }
      customer: {
        Row: {
          id: string
          company_id: number
          name: string | null
          created_at: string
        }
      }
      company: {
        Row: {
          id: number
          created_at: string
          name: string | null
          doc_num: string | null
          income_yr: number | null
          size_level: number | null
          employees_num: number | null
          income_level: number | null
          company_settings_id: number | null
          creator: string | null
          comany_id_name: string | null
          company_code: string | null
          corporate_group_id: number | null
        }
      }
      rule_type: {
        Row: {
          id: number
          created_at: string
          name: string | null
        }
      }
      asset_origin: {
        Row: {
          id: number
          created_at: string
          name: string | null
        }
      }
      bkpg_channel: {
        Row: {
          id: number
          created_at: string
          name: string | null
        }
      }
     output_channel: {
       Row: {
         id: number
         name: string
         created_at: string
       }
     }
     banks: {
       Row: {
         id: number
         name: string
         created_at: string
       }
     }
     rule_banks: {
       Row: {
         rule_id: number
         bank_id: number
         created_at: string
       }
     }
     partner_type: {
       Row: {
         id: number
         created_at: string
         name: string | null
       }
     }
    }
    supplier: {
      Row: {
        id: string
        company_id: number | null
        created_at: string
        name: string | null
        company_id: number | null
      }
    }
  }
}