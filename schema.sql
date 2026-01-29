
-- PakResto ERP: Inventory & Operations Schema

-- 1. Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ntn_number VARCHAR(50), -- National Tax Number (Pakistan)
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(50) DEFAULT 'Lahore',
    payment_terms VARCHAR(100), -- E.g., 'Net 30', 'Cash on Delivery'
    outstanding_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory Items (Master Data)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL, -- kg, l, gm, unit
    min_stock_level DECIMAL(12, 2) DEFAULT 0,
    current_stock DECIMAL(12, 2) DEFAULT 0,
    average_unit_cost DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Stock Batches (FIFO Tracking)
CREATE TABLE stock_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id),
    batch_number VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    quantity_received DECIMAL(12, 2) NOT NULL,
    quantity_remaining DECIMAL(12, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    po_reference VARCHAR(100)
);

-- 4. Recipe Management (Bill of Materials)
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    selling_price DECIMAL(15, 2) NOT NULL,
    tax_category VARCHAR(50), -- 'PRA', 'SRB', 'FBR'
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id),
    ingredient_id UUID REFERENCES inventory_items(id),
    quantity_required DECIMAL(12, 4) NOT NULL, -- Quantity per serving
    wastage_allowance DECIMAL(5, 2) DEFAULT 0 -- Expected % wastage
);

-- 5. Wastage Tracking
CREATE TABLE wastage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id),
    quantity DECIMAL(12, 2) NOT NULL,
    reason_code VARCHAR(50), -- 'burnt', 'expired', 'spoiled'
    logged_by UUID,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    theoretical_cost_impact DECIMAL(15, 2)
);

-- 6. Local Compliance (FBR Logs)
CREATE TABLE fbr_pos_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE,
    fbr_invoice_number VARCHAR(100), -- Returned by FBR API
    total_amount DECIMAL(15, 2),
    tax_amount DECIMAL(15, 2),
    status VARCHAR(20), -- 'success', 'failed'
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
