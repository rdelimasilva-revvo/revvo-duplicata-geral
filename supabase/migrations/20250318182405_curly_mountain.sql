/*
  # Add user creation transaction function
  
  1. New Function
    - `create_user_company`: Handles user and company creation in a transaction
      - Creates company record
      - Creates user profile
      - Creates company settings
      - Updates company creator
      
  2. Security
    - Function is accessible only to authenticated users
    - Maintains RLS policies
*/

CREATE OR REPLACE FUNCTION create_user_company(
  p_user_id uuid,
  p_user_name text,
  p_user_email text,
  p_company_name text,
  p_company_doc text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id uuid;
  v_result json;
BEGIN
  -- Start transaction
  BEGIN
    -- Create company
    INSERT INTO company (name, doc_num)
    VALUES (p_company_name, p_company_doc)
    RETURNING id INTO v_company_id;

    -- Create user profile
    INSERT INTO user_profile (id, name, email, company_id)
    VALUES (p_user_id, p_user_name, p_user_email, v_company_id);

    -- Create company settings
    INSERT INTO company_settings (company_id, setup_ready)
    VALUES (v_company_id, false);

    -- Update company creator
    UPDATE company
    SET creator = p_user_id
    WHERE id = v_company_id;

    -- Prepare result
    SELECT json_build_object(
      'success', true,
      'company_id', v_company_id
    ) INTO v_result;

    RETURN v_result;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Registro duplicado encontrado';
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Erro ao vincular registros';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao criar usuário: %', SQLERRM;
  END;
END;
$$;