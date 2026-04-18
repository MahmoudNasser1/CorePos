export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      backup_logs: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          file_url: string | null
          id: string
          size_bytes: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          id?: string
          size_bytes?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          id?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_logs_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_logs_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "backup_logs_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_logs_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount: number
          billing_cycle: string
          company_id: string
          created_at: string | null
          currency: string | null
          gateway_txn_id: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          period_end: string | null
          period_start: string | null
          plan_id: string | null
          receipt_url: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount: number
          billing_cycle: string
          company_id: string
          created_at?: string | null
          currency?: string | null
          gateway_txn_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_id?: string | null
          receipt_url?: string | null
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string
          company_id?: string
          created_at?: string | null
          currency?: string | null
          gateway_txn_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_id?: string | null
          receipt_url?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "billing_history_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          name_en: string | null
          owner_id: string | null
          phone: string | null
          slug: string | null
          tax_number: string | null
          timezone: string | null
          vat_rate: number | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          name_en?: string | null
          owner_id?: string | null
          phone?: string | null
          slug?: string | null
          tax_number?: string | null
          timezone?: string | null
          vat_rate?: number | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          name_en?: string | null
          owner_id?: string | null
          phone?: string | null
          slug?: string | null
          tax_number?: string | null
          timezone?: string | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance: number | null
          company_id: string
          created_at: string | null
          credit_limit: number | null
          default_price_list: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          phone2: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          company_id: string
          created_at?: string | null
          credit_limit?: number | null
          default_price_list?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          phone2?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          company_id?: string
          created_at?: string | null
          credit_limit?: number | null
          default_price_list?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          phone2?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          company_id: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_categories_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "expense_categories_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          branch_id: string | null
          category_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          notes: string | null
          treasury_id: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          category_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          treasury_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          treasury_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_treasury_id_fkey"
            columns: ["treasury_id"]
            referencedRelation: "treasuries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          cost_price: number | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          id: string
          invoice_id: string
          notes: string | null
          product_id: string
          profit: number | null
          qty: number
          sort_order: number | null
          total_line: number
          unit_price: number
          warehouse_id: string | null
        }
        Insert: {
          cost_price?: number | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          invoice_id: string
          notes?: string | null
          product_id: string
          profit?: number | null
          qty: number
          sort_order?: number | null
          total_line: number
          unit_price: number
          warehouse_id?: string | null
        }
        Update: {
          cost_price?: number | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          invoice_id?: string
          notes?: string | null
          product_id?: string
          profit?: number | null
          qty?: number
          sort_order?: number | null
          total_line?: number
          unit_price?: number
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "v_invoice_profits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "v_stock_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequences: {
        Row: {
          company_id: string
          invoice_type: string
          last_number: number | null
          year_month: string
        }
        Insert: {
          company_id: string
          invoice_type: string
          last_number?: number | null
          year_month: string
        }
        Update: {
          company_id?: string
          invoice_type?: string
          last_number?: number | null
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_sequences_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_sequences_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "invoice_sequences_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          branch_id: string
          cashier_id: string | null
          company_id: string
          created_at: string | null
          customer_id: string | null
          date: string
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid: number | null
          parent_id: string | null
          reference_id: string | null
          remaining: number | null
          salesman_id: string | null
          status: string
          subtotal: number | null
          supplier_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          type: string
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          branch_id: string
          cashier_id?: string | null
          company_id: string
          created_at?: string | null
          customer_id?: string | null
          date?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid?: number | null
          parent_id?: string | null
          reference_id?: string | null
          remaining?: number | null
          salesman_id?: string | null
          status?: string
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          type: string
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          branch_id?: string
          cashier_id?: string | null
          company_id?: string
          created_at?: string | null
          customer_id?: string | null
          date?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid?: number | null
          parent_id?: string | null
          reference_id?: string | null
          remaining?: number | null
          salesman_id?: string | null
          status?: string
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          type?: string
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_cashier_id_fkey"
            columns: ["cashier_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "v_invoice_profits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reference_id_fkey"
            columns: ["reference_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reference_id_fkey"
            columns: ["reference_id"]
            referencedRelation: "v_invoice_profits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_salesman_id_fkey"
            columns: ["salesman_id"]
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          check_date: string | null
          check_number: string | null
          check_status: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          date: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          supplier_id: string | null
          treasury_id: string | null
          type: string
        }
        Insert: {
          amount: number
          check_date?: string | null
          check_number?: string | null
          check_status?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          method: string
          notes?: string | null
          supplier_id?: string | null
          treasury_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          check_date?: string | null
          check_number?: string | null
          check_status?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          supplier_id?: string | null
          treasury_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "v_invoice_profits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_treasury_id_fkey"
            columns: ["treasury_id"]
            referencedRelation: "treasuries"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_branches: number | null
          max_invoices_month: number | null
          max_products: number | null
          max_users: number | null
          max_warehouses: number | null
          name: string
          name_en: string
          price_lifetime: number | null
          price_monthly: number | null
          price_yearly: number | null
          slug: string
          sort_order: number | null
          storage_mb: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_invoices_month?: number | null
          max_products?: number | null
          max_users?: number | null
          max_warehouses?: number | null
          name: string
          name_en: string
          price_lifetime?: number | null
          price_monthly?: number | null
          price_yearly?: number | null
          slug: string
          sort_order?: number | null
          storage_mb?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_invoices_month?: number | null
          max_products?: number | null
          max_users?: number | null
          max_warehouses?: number | null
          name?: string
          name_en?: string
          price_lifetime?: number | null
          price_monthly?: number | null
          price_yearly?: number | null
          slug?: string
          sort_order?: number | null
          storage_mb?: number | null
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
        }
        Relationships: []
      }
      platform_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "platform_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_audit_log_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_audit_log_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "platform_audit_log_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_notifications: {
        Row: {
          body: string
          company_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          type: string | null
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type?: string | null
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_notifications_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_notifications_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "platform_notifications_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stock: {
        Row: {
          avg_cost: number | null
          id: string
          product_id: string
          qty: number | null
          warehouse_id: string
        }
        Insert: {
          avg_cost?: number | null
          id?: string
          product_id: string
          qty?: number | null
          warehouse_id: string
        }
        Update: {
          avg_cost?: number | null
          id?: string
          product_id?: string
          qty?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "v_stock_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_cost: number | null
          barcode: string | null
          category_id: string | null
          company_id: string
          cost_price: number | null
          created_at: string | null
          description: string | null
          has_serial: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_qty: number | null
          name: string
          name_en: string | null
          price1: number | null
          price2: number | null
          price3: number | null
          sku: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          avg_cost?: number | null
          barcode?: string | null
          category_id?: string | null
          company_id: string
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          has_serial?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_qty?: number | null
          name: string
          name_en?: string | null
          price1?: number | null
          price2?: number | null
          price3?: number | null
          sku?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_cost?: number | null
          barcode?: string | null
          category_id?: string | null
          company_id?: string
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          has_serial?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_qty?: number | null
          name?: string
          name_en?: string | null
          price1?: number | null
          price2?: number | null
          price3?: number | null
          sku?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_unit_id_fkey"
            columns: ["unit_id"]
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch_id: string | null
          company_id: string | null
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          role: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          id: string
          module: string
          role: string
        }
        Insert: {
          action: string
          id?: string
          module: string
          role: string
        }
        Update: {
          action?: string
          id?: string
          module?: string
          role?: string
        }
        Relationships: []
      }
      salesmen: {
        Row: {
          commission_rate: number | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          commission_rate?: number | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          commission_rate?: number | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salesmen_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesmen_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "salesmen_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      serial_numbers: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string | null
          product_id: string | null
          serial: string
          status: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          serial: string
          status?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          serial?: string
          status?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serial_numbers_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "v_stock_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          branch_id: string
          cashier_id: string
          closed_at: string | null
          closing_cash: number | null
          difference: number | null
          expected_cash: number | null
          id: string
          notes: string | null
          opened_at: string
          opening_cash: number | null
          status: string | null
          treasury_id: string | null
        }
        Insert: {
          branch_id: string
          cashier_id: string
          closed_at?: string | null
          closing_cash?: number | null
          difference?: number | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number | null
          status?: string | null
          treasury_id?: string | null
        }
        Update: {
          branch_id?: string
          cashier_id?: string
          closed_at?: string | null
          closing_cash?: number | null
          difference?: number | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number | null
          status?: string | null
          treasury_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_cashier_id_fkey"
            columns: ["cashier_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_treasury_id_fkey"
            columns: ["treasury_id"]
            referencedRelation: "treasuries"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          canceled_at: string | null
          company_id: string
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          ends_at: string | null
          gateway_sub_id: string | null
          id: string
          last_invoice_at: string | null
          next_invoice_at: string | null
          notes: string | null
          payment_gateway: string | null
          plan_id: string
          status: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle: string
          canceled_at?: string | null
          company_id: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ends_at?: string | null
          gateway_sub_id?: string | null
          id?: string
          last_invoice_at?: string | null
          next_invoice_at?: string | null
          notes?: string | null
          payment_gateway?: string | null
          plan_id: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          canceled_at?: string | null
          company_id?: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ends_at?: string | null
          gateway_sub_id?: string | null
          id?: string
          last_invoice_at?: string | null
          next_invoice_at?: string | null
          notes?: string | null
          payment_gateway?: string | null
          plan_id?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          balance: number | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          phone2: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          phone2?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          phone2?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      treasuries: {
        Row: {
          balance: number | null
          branch_id: string | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          type: string | null
        }
        Insert: {
          balance?: number | null
          branch_id?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          type?: string | null
        }
        Update: {
          balance?: number | null
          branch_id?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treasuries_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasuries_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasuries_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "treasuries_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          notes: string | null
          reference_id: string | null
          reference_type: string | null
          treasury_id: string
          type: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          treasury_id: string
          type: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          treasury_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_transactions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_transactions_treasury_id_fkey"
            columns: ["treasury_id"]
            referencedRelation: "treasuries"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
          name_en: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
          name_en?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
          name_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_stats: {
        Row: {
          branches_count: number | null
          company_id: string
          id: string
          invoices_count: number | null
          month: string
          products_count: number | null
          storage_used_mb: number | null
          updated_at: string | null
          users_count: number | null
          warehouses_count: number | null
        }
        Insert: {
          branches_count?: number | null
          company_id: string
          id?: string
          invoices_count?: number | null
          month: string
          products_count?: number | null
          storage_used_mb?: number | null
          updated_at?: string | null
          users_count?: number | null
          warehouses_count?: number | null
        }
        Update: {
          branches_count?: number | null
          company_id?: string
          id?: string
          invoices_count?: number | null
          month?: string
          products_count?: number | null
          storage_used_mb?: number | null
          updated_at?: string | null
          users_count?: number | null
          warehouses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_stats_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_stats_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_saas_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "usage_stats_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "v_trials_expiring_soon"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_daily_summary: {
        Row: {
          branch_id: string | null
          date: string | null
          net_sales: number | null
          sales_count: number | null
          total_purchases: number | null
          total_sales: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      v_invoice_profits: {
        Row: {
          cost: number | null
          customer_id: string | null
          customer_name: string | null
          date: string | null
          gross_profit: number | null
          id: string | null
          profit_margin: number | null
          revenue: number | null
          total: number | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      v_saas_overview: {
        Row: {
          billing_cycle: string | null
          branches_count: number | null
          company_email: string | null
          company_id: string | null
          company_name: string | null
          current_period_end: string | null
          invoices_count: number | null
          joined_at: string | null
          plan_name: string | null
          plan_slug: string | null
          products_count: number | null
          subscription_status: string | null
          trial_ends_at: string | null
          users_count: number | null
        }
        Relationships: []
      }
      v_saas_revenue: {
        Row: {
          month: string | null
          payments_count: number | null
          plan: string | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_stock_report: {
        Row: {
          avg_cost: number | null
          barcode: string | null
          category_name: string | null
          id: string | null
          low_stock: boolean | null
          min_qty: number | null
          name: string | null
          price1: number | null
          price2: number | null
          price3: number | null
          qty: number | null
          stock_value: number | null
          warehouse_id: string | null
          warehouse_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      v_trials_expiring_soon: {
        Row: {
          email: string | null
          id: string | null
          name: string | null
          time_left: string | null
          trial_ends_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_add_user: { Args: { p_company_id: string }; Returns: boolean }
      can_create_invoice: { Args: { p_company_id: string }; Returns: boolean }
      get_company_limits: { Args: { p_company_id: string }; Returns: Json }
      next_invoice_number: {
        Args: { p_company_id: string; p_type?: string }
        Returns: string
      }
      refresh_usage_stats: {
        Args: { p_company_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
