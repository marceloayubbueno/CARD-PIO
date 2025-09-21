// Admin Panel JavaScript
let restaurantSchedule = {
    openingTime: '18:00',
    closingTime: '23:50',
    workingDays: [0, 1, 2, 3, 4, 5, 6], // 0 = Domingo, 1 = Segunda, etc.
    forceClose: false,
    maintenanceMode: false
};

// DOM Elements
const currentStatus = document.getElementById('current-status');
const currentTime = document.getElementById('current-time');
const openingTimeInput = document.getElementById('opening-time');
const closingTimeInput = document.getElementById('closing-time');
const dayCheckboxes = document.querySelectorAll('.day-checkbox');
const forceCloseToggle = document.getElementById('force-close');
const maintenanceToggle = document.getElementById('maintenance-mode');
const saveScheduleBtn = document.getElementById('save-schedule');
const testScheduleBtn = document.getElementById('test-schedule');

// Load saved schedule from JSON file
async function loadSchedule() {
    try {
        const response = await fetch('./schedule.json');
        if (response.ok) {
            const data = await response.json();
            restaurantSchedule = { ...restaurantSchedule, ...data };
        }
    } catch (error) {
        console.log('Usando configurações padrão');
    }
    
    // Update UI with loaded data
    openingTimeInput.value = restaurantSchedule.openingTime;
    closingTimeInput.value = restaurantSchedule.closingTime;
    
    dayCheckboxes.forEach(checkbox => {
        checkbox.checked = restaurantSchedule.workingDays.includes(parseInt(checkbox.value));
    });
    
    forceCloseToggle.checked = restaurantSchedule.forceClose;
    maintenanceToggle.checked = restaurantSchedule.maintenanceMode;
}

// Save schedule (shows instructions for production)
function saveSchedule() {
    // Add timestamp
    restaurantSchedule.lastUpdated = new Date().toISOString();
    
    // Show instructions for production
    const scheduleJson = JSON.stringify(restaurantSchedule, null, 2);
    
    Toastify({
        text: "Configurações prontas! Veja as instruções abaixo.",
        duration: 5000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "#3b82f6",
        },
    }).showToast();
    
    // Show modal with instructions
    showSaveInstructions(scheduleJson);
}

// Show save instructions modal
function showSaveInstructions(jsonData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h3 class="text-xl font-bold text-gray-800 mb-4">📋 Instruções para Salvar</h3>
            <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">1. Copie o JSON abaixo:</h4>
                    <textarea readonly class="w-full h-32 p-3 bg-gray-100 rounded border text-sm font-mono" id="json-output">${jsonData}</textarea>
                    <button onclick="copyJson()" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-sm">
                        📋 Copiar JSON
                    </button>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-green-800 mb-2">2. Atualize o arquivo schedule.json:</h4>
                    <ol class="text-sm text-green-700 space-y-1">
                        <li>• Acesse seu projeto na Vercel</li>
                        <li>• Vá para a pasta do projeto</li>
                        <li>• Abra o arquivo <code class="bg-green-200 px-1 rounded">schedule.json</code></li>
                        <li>• Substitua todo o conteúdo pelo JSON copiado</li>
                        <li>• Salve e faça commit</li>
                        <li>• A Vercel fará deploy automático</li>
                    </ol>
                </div>
                
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-yellow-800 mb-2">⚠️ Importante:</h4>
                    <p class="text-sm text-yellow-700">
                        Esta é uma solução temporária. Para uma solução profissional, 
                        considere usar um CMS como Strapi ou Firebase.
                    </p>
                </div>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="closeModal()" class="bg-gray-500 text-white px-6 py-2 rounded">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add copy function
    window.copyJson = function() {
        const textarea = document.getElementById('json-output');
        textarea.select();
        document.execCommand('copy');
        
        Toastify({
            text: "JSON copiado!",
            duration: 2000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#10b981",
            },
        }).showToast();
    };
    
    window.closeModal = function() {
        document.body.removeChild(modal);
    };
}

// Check if restaurant is open
function checkRestaurantStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    
    // Check if forced closed
    if (restaurantSchedule.forceClose) {
        return { isOpen: false, reason: 'Fechado temporariamente' };
    }
    
    // Check if in maintenance mode
    if (restaurantSchedule.maintenanceMode) {
        return { isOpen: false, reason: 'Em manutenção' };
    }
    
    // Check if today is a working day
    if (!restaurantSchedule.workingDays.includes(currentDay)) {
        return { isOpen: false, reason: 'Não funciona hoje' };
    }
    
    // Parse opening and closing times
    const [openHour, openMinute] = restaurantSchedule.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = restaurantSchedule.closingTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    const currentTime = currentHour * 60 + currentMinute;
    
    // Check if current time is within working hours
    if (currentTime >= openTime && currentTime <= closeTime) {
        return { isOpen: true, reason: 'Aberto' };
    } else if (currentTime < openTime) {
        return { isOpen: false, reason: `Abre às ${restaurantSchedule.openingTime}` };
    } else {
        return { isOpen: false, reason: `Fechou às ${restaurantSchedule.closingTime}` };
    }
}

// Update status display
function updateStatus() {
    const status = checkRestaurantStatus();
    const now = new Date();
    
    // Update status
    if (status.isOpen) {
        currentStatus.innerHTML = '<span class="text-green-600"><i class="fa fa-check-circle mr-2"></i>Aberto</span>';
    } else {
        currentStatus.innerHTML = '<span class="text-red-600"><i class="fa fa-times-circle mr-2"></i>Fechado</span>';
    }
    
    // Update current time
    currentTime.textContent = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Event Listeners
saveScheduleBtn.addEventListener('click', function() {
    // Update restaurant schedule
    restaurantSchedule.openingTime = openingTimeInput.value;
    restaurantSchedule.closingTime = closingTimeInput.value;
    
    // Update working days
    restaurantSchedule.workingDays = Array.from(dayCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => parseInt(checkbox.value));
    
    restaurantSchedule.forceClose = forceCloseToggle.checked;
    restaurantSchedule.maintenanceMode = maintenanceToggle.checked;
    
    // Save to localStorage
    saveSchedule();
    
    // Update status
    updateStatus();
});

testScheduleBtn.addEventListener('click', function() {
    const status = checkRestaurantStatus();
    
    Toastify({
        text: `Status: ${status.isOpen ? 'Aberto' : 'Fechado'} - ${status.reason}`,
        duration: 4000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: status.isOpen ? "#10b981" : "#ef4444",
        },
    }).showToast();
});

// Real-time updates
setInterval(updateStatus, 1000); // Update every second

// Initialize
loadSchedule();
updateStatus();

// Export schedule for use in main site
window.getRestaurantSchedule = function() {
    return restaurantSchedule;
};
