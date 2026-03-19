-- Schema Hardening: Add a non-negative balance constraint to the accounts table
ALTER TABLE accounts 
ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
