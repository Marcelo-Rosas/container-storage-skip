-- Add bl_number column to containers table
ALTER TABLE containers ADD COLUMN IF NOT EXISTS bl_number TEXT;

-- Create view for containers with stats
-- We drop it first to ensure clean creation if re-run (though strictly migration files run once)
DROP VIEW IF EXISTS containers_stats_view;

CREATE VIEW containers_stats_view AS
SELECT
    c.id,
    c.container_number,
    c.container_code,
    c.bl_number,
    c.start_date,
    c.status,
    c.yard_location,
    c.nominal_volume_m3,
    c.base_cost_brl,
    c.client_id,
    c.container_type,
    cl.name as client_name,
    ct.name as container_type_name,
    COUNT(DISTINCT i.sku) as items_count,
    COALESCE(SUM(i.total_volume_m3), 0) as used_volume,
    COALESCE(SUM(i.unit_gross_weight_kg * i.current_quantity), 0) as total_gross_weight
FROM containers c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN container_types ct ON c.container_type = ct.code
LEFT JOIN inventory i ON c.id = i.container_id
GROUP BY
    c.id,
    c.container_number,
    c.container_code,
    c.bl_number,
    c.start_date,
    c.status,
    c.yard_location,
    c.nominal_volume_m3,
    c.base_cost_brl,
    c.client_id,
    c.container_type,
    cl.name,
    ct.name;

-- Grant permissions to authenticated users
GRANT SELECT ON containers_stats_view TO authenticated;
GRANT SELECT ON containers_stats_view TO service_role;
