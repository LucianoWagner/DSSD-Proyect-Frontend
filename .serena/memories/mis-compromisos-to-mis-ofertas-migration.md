# Migration from mis-compromisos to mis-ofertas Endpoint

## Current Implementation Analysis

### Endpoint Details
**Current Endpoint:** `GET /api/v1/ofertas/mis-compromisos`
**Query Parameter:** `estado_pedido` (filters by pedido state: PENDIENTE, COMPROMETIDO, COMPLETADO)

**New Endpoint:** `GET /api/v1/ofertas/mis-ofertas`
**Query Parameter:** `estado_oferta` (filters by offer state: pendiente, aceptada, rechazada)

### Current Data Structure
Returns: `CompromisoWithPedido[]` which contains:
- Oferta fields (id, pedido_id, user_id, descripcion, monto_ofrecido, estado, created_at, updated_at)
- Nested pedido object with:
  - PedidoBasic fields (id, etapa_id, tipo, descripcion, estado, monto, moneda, cantidad, unidad, created_at, updated_at)
  - Nested proyecto object (id, titulo, estado)
  - Nested etapa object (id, nombre)

## Files That Need Updates

### 1. API Type Definitions
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/types/openapi.ts`
- Lines 255-271: Path definition for `/api/v1/ofertas/mis-compromisos`
- Line 263: Operation reference `list_my_compromisos_api_v1_ofertas_mis_compromisos_get`
- Lines 1659-1690: Operation definition with parameters and response schema
- Currently accepts query param: `estado_pedido?: string | null`
- Needs to change to: `estado_oferta?: string | null`

### 2. Custom Hook
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/hooks/colaboraciones/use-get-mis-compromisos.ts`
- Lines 5, 26: Endpoint URL reference `/api/v1/ofertas/mis-compromisos`
- Lines 23, 30: Query parameter name `estado_pedido`
- Lines 21-45: `useGetMisCompromisos()` function - main fetch hook
- Lines 51-77: `useGetCompromisosStats()` function - statistics calculation
- Lines 83-106: `useFilteredCompromisos()` function - client-side filtering
- Lines 112-141: `useCompromisosActivosCount()` function - count active commitments

### 3. Invalidation References
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/hooks/colaboraciones/use-create-oferta.ts`
- Line 47: Query key invalidation for `["ofertas", "mis-compromisos"]`
- Should change to: `["ofertas", "mis-ofertas"]`

**File:** `/home/matespinetti/facultad/frontend-project-planning/src/hooks/colaboraciones/use-confirmar-realizacion.ts`
- Line 47: Query key invalidation for `["ofertas", "mis-compromisos"]`
- Should change to: `["ofertas", "mis-ofertas"]`

### 4. Type Definitions
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/types/colaboraciones.ts`
- Lines 163-166: `CompromisosFilters` interface - may need adjustment if changing from `estado_pedido` to `estado_oferta`
- No direct changes needed unless filtering logic changes

### 5. Page Component
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/app/(dashboard)/colaboraciones/compromisos/page.tsx`
- Lines 10: Import `useFilteredCompromisos` and `useGetCompromisosStats`
- Lines 34-47: Filter logic based on tabs (may need updating if switching from estado_pedido to estado_oferta)
- Uses client-side filtering with `useFilteredCompromisos()` function
- Will likely still work but filtering mechanism might need adjustment

### 6. Component
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/components/colaboraciones/compromiso-card.tsx`
- No endpoint references, just displays data
- Depends on `CompromisoWithPedido` type - should continue working

### 7. Navigation (No changes needed)
**File:** `/home/matespinetti/facultad/frontend-project-planning/src/consts/sidebar/navigation.ts`
- Line 98: URL reference `/colaboraciones/compromisos` - this is a route, not an API endpoint
- No changes needed

## Summary of Changes Required

1. **openapi.ts**: Update path from `/api/v1/ofertas/mis-compromisos` to `/api/v1/ofertas/mis-ofertas`, change query param from `estado_pedido` to `estado_oferta`
2. **use-get-mis-compromisos.ts**: Update endpoint URL and query parameter names across all 4 exported functions
3. **use-create-oferta.ts**: Update query key invalidation from `["ofertas", "mis-compromisos"]` to `["ofertas", "mis-ofertas"]`
4. **use-confirmar-realizacion.ts**: Update query key invalidation from `["ofertas", "mis-compromisos"]` to `["ofertas", "mis-ofertas"]`
5. **page.tsx**: Potentially update filter logic if the new endpoint requires estado_oferta filtering instead of estado_pedido

## Key Considerations

- The new endpoint returns offers filtered by `estado_oferta` (pendiente, aceptada, rechazada) instead of `estado_pedido`
- Existing filter logic in page.tsx tabs may need adjustment
- Stats calculation logic will need to be updated if filtering logic changes
- The data structure (CompromisoWithPedido) should remain compatible as it still contains both offer and pedido data
