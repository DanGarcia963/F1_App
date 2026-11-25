# F2 migration / integration (review only)
1. Run database/01_F2_MULTICATEGORIA.sql after the F1 seed. Verify current F1 queries.
2. Run database/02_F2_PREPARAR_CARGA.sql (empty private staging tables).
3. Obtain complete official season data, map driver identity, team and circuit IDs; insert normalized rows into private staging tables. No certified dataset is bundled. The preliminary data in data-history-2011-2020 is NOT suitable for publication as-is.
4. Verify expected counts against official sources and run 04_F2_AUDITAR_CARGA.sql. Document all legitimate point adjustments. The audit must reconcile to zero; set verificado=true only after verification against source.
5. Run database/03_F2_PUBLICAR_VERIFICADOS.sql; it aborts with no verified batches or incomplete data.
6. Test migrations and API in a backup DB, then merge backend review branch into backend-supabase and frontend review branch into frontend-deploy. Admin writes and visual labels still require end-to-end testing. F1 seeds remain compatible.
Nominal GP represents Feature Race and SP represents Sprint Race; distinct source identifiers and session numbers handle multiple races per round. In 2026 Baku hosted two Feature Races. The season table remains shared, per-category finalization is stored separately.
