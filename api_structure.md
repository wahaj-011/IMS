
# PakResto ERP API Architecture

Recommended structure for Node.js (Express) or Python (FastAPI):

```text
/api
  /auth
    - login.controller.ts
    - middleware.ts        # JWT & Role-based Access (Admin, Manager, Chef)
  /inventory
    - items.routes.ts      # CRUD for Master Items
    - stock.service.ts     # FIFO logic, Batch reduction
    - wastage.routes.ts    # Wastage logging
  /procurement
    - suppliers.routes.ts  # Vendor management
    - po.generator.ts      # PDF Generation service for Purchase Orders
  /pos-integration
    - fbr.service.ts       # FBR Tier-1 API Bridge
    - recipe.service.ts    # Deducting stock on successful sales
  /finance
    - payments.routes.ts   # EasyPaisa / JazzCash / HBL API Handlers
    - tax.calculator.ts    # PRA/SRB dynamic calculations
  /webhooks
    - easypaisa.ts         # Payment confirmation callbacks
```

### Key Endpoint Examples:
- `POST /api/inventory/wastage`: Logs kitchen loss and updates actual stock.
- `POST /api/pos/sale`: Receives payload from POS, calculates tax based on region, notifies FBR, and deducts ingredients from `inventory_items` using `recipe_ingredients` mappings.
- `GET /api/inventory/alerts`: Fetches low stock items and items expiring within 7 days.
