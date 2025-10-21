// 🧪 Skrypt testowy dla Supabase
// Uruchom w konsoli przeglądarki na stronie z Supabase

// 1. Sprawdź strukturę tabeli jobs
async function checkJobsTable() {
    console.log('🔍 Sprawdzanie struktury tabeli jobs...');
    
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .limit(5);
            
        if (error) throw error;
        
        console.log('✅ Tabela jobs istnieje');
        console.log('📊 Przykładowe dane:', data);
        
        if (data.length > 0) {
            console.log('🔑 Kolumny:', Object.keys(data[0]));
        }
        
        return data;
    } catch (error) {
        console.error('❌ Błąd:', error);
        return null;
    }
}

// 2. Utwórz testowe zadanie
async function createTestJob() {
    console.log('➕ Tworzenie testowego zadania...');
    
    try {
        const { data, error } = await supabase
            .from('jobs')
            .insert([
                {
                    status: 'processing',
                    content_type: 'test',
                    content_data: { 
                        test: true, 
                        timestamp: new Date().toISOString() 
                    }
                }
            ])
            .select()
            .single();
            
        if (error) throw error;
        
        console.log('✅ Testowe zadanie utworzone:', data.id);
        console.log('📄 Dane:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Błąd tworzenia zadania:', error);
        return null;
    }
}

// 3. Sprawdź status konkretnego zadania
async function checkJobStatus(jobId) {
    console.log(`🔍 Sprawdzanie statusu zadania: ${jobId}`);
    
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('status, created_at')
            .eq('id', jobId)
            .single();
            
        if (error) throw error;
        
        console.log('📊 Status:', data.status);
        console.log('⏰ Utworzone:', data.created_at);
        
        return data;
    } catch (error) {
        console.error('❌ Błąd sprawdzania statusu:', error);
        return null;
    }
}

// 4. Zmień status zadania
async function updateJobStatus(jobId, newStatus) {
    console.log(`🔄 Zmiana statusu zadania ${jobId} na: ${newStatus}`);
    
    const validStatuses = ['processing', 'completed', 'failed'];
    if (!validStatuses.includes(newStatus)) {
        console.error('❌ Nieprawidłowy status. Dozwolone:', validStatuses);
        return null;
    }
    
    try {
        const { data, error } = await supabase
            .from('jobs')
            .update({ status: newStatus })
            .eq('id', jobId)
            .select()
            .single();
            
        if (error) throw error;
        
        console.log('✅ Status zaktualizowany');
        console.log('📄 Zaktualizowane dane:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Błąd aktualizacji statusu:', error);
        return null;
    }
}

// 5. Usuń zadania testowe
async function clearTestJobs() {
    console.log('🧹 Usuwanie zadań testowych...');
    
    try {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('content_type', 'test');
            
        if (error) throw error;
        
        console.log('✅ Zadania testowe usunięte');
    } catch (error) {
        console.error('❌ Błąd usuwania zadań testowych:', error);
    }
}

// 6. Symuluj pełny cykl życia zadania
async function simulateJobLifecycle() {
    console.log('🎭 Symulacja pełnego cyklu życia zadania...');
    
    // Utwórz zadanie
    const job = await createTestJob();
    if (!job) return;
    
    const jobId = job.id;
    
    // Sprawdź status
    await checkJobStatus(jobId);
    
    // Symuluj przetwarzanie (czekaj 2 sekundy)
    console.log('⏳ Symulacja przetwarzania...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Zmień na completed
    await updateJobStatus(jobId, 'completed');
    
    // Sprawdź status ponownie
    await checkJobStatus(jobId);
    
    console.log('🎉 Symulacja zakończona!');
}

// 7. Sprawdź uprawnienia RLS
async function checkRLSPermissions() {
    console.log('🔐 Sprawdzanie uprawnień RLS...');
    
    try {
        // Próbuj odczytać dane
        const { data: readData, error: readError } = await supabase
            .from('jobs')
            .select('*')
            .limit(1);
            
        if (readError) {
            console.warn('⚠️ Błąd odczytu (może być RLS):', readError.message);
        } else {
            console.log('✅ Odczyt działa');
        }
        
        // Próbuj zapisać dane
        const { data: writeData, error: writeError } = await supabase
            .from('jobs')
            .insert([{ status: 'processing', content_type: 'rls_test' }])
            .select()
            .single();
            
        if (writeError) {
            console.warn('⚠️ Błąd zapisu (może być RLS):', writeError.message);
        } else {
            console.log('✅ Zapis działa');
            // Usuń testowy rekord
            await supabase.from('jobs').delete().eq('id', writeData.id);
        }
        
    } catch (error) {
        console.error('❌ Błąd sprawdzania uprawnień:', error);
    }
}

// 🚀 Główna funkcja testowa
async function runAllTests() {
    console.log('🧪 Uruchamianie wszystkich testów...');
    console.log('=====================================');
    
    await checkJobsTable();
    console.log('---');
    
    await checkRLSPermissions();
    console.log('---');
    
    await simulateJobLifecycle();
    console.log('---');
    
    await clearTestJobs();
    console.log('---');
    
    console.log('✅ Wszystkie testy zakończone!');
}

// 📋 Instrukcje użycia
console.log(`
🧪 Skrypty testowe Supabase
===========================

Dostępne funkcje:
- checkJobsTable() - sprawdza strukturę tabeli
- createTestJob() - tworzy testowe zadanie
- checkJobStatus(jobId) - sprawdza status zadania
- updateJobStatus(jobId, status) - zmienia status
- clearTestJobs() - usuwa zadania testowe
- simulateJobLifecycle() - symuluje pełny cykl
- checkRLSPermissions() - sprawdza uprawnienia RLS
- runAllTests() - uruchamia wszystkie testy

Przykład użycia:
1. runAllTests() - pełny test
2. createTestJob() - tylko utworzenie zadania
3. updateJobStatus('job-id', 'completed') - zmiana statusu

⚠️ Uwaga: Upewnij się, że klient supabase jest zainicjalizowany!
`);

// Eksportuj funkcje do globalnego scope
window.testSupabase = {
    checkJobsTable,
    createTestJob,
    checkJobStatus,
    updateJobStatus,
    clearTestJobs,
    simulateJobLifecycle,
    checkRLSPermissions,
    runAllTests
};



