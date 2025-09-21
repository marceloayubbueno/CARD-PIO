const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total") 
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-bnt")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")  

// Step navigation elements
const nextStepBtn = document.getElementById("next-step-btn")
const prevStepBtn = document.getElementById("prev-step-btn")
const customerName = document.getElementById("customer-name")
const customerPhone = document.getElementById("customer-phone")
const reference = document.getElementById("reference")

let cart = [];
let currentStep = 1;

// Abrir o modal do carrinho
cartBtn.addEventListener("click", async function() {
    // Verificar se o restaurante está aberto
    const isOpen = await checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "🚫 Restaurante fechado! Funcionamos das 18:00 às 23:50",
            duration: 4000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    currentStep = 1;
    updateCartModal();
    showStep(1);
    cartModal.style.display = "flex"
})
            
// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event){
    if(event.target === cartModal){
        cartModal.style.display = "none"
        resetSteps();
    }
})

// botão fechar modal
closeModalBtn.addEventListener("click", function(){
cartModal.style.display = "none"
    resetSteps();
})

// Step navigation
nextStepBtn.addEventListener("click", function() {
    if(validateCurrentStep()) {
        if(currentStep < 4) {
            currentStep++;
            showStep(currentStep);
        }
    }
})

prevStepBtn.addEventListener("click", function() {
    if(currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
})

// CLIQUE NOS ITENS DO MENU 

menu.addEventListener("click", async function(event){
   

   let parentButton = event.target.closest(".add-to-cart-btn")

    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price")
    )
      
    await addToCart(name,price)

    }

})

// FUNÇÃO PARA ADICIONAR NO CARRINHO 
async function addToCart(name, price){
    // Verificar se o restaurante está aberto
    const isOpen = await checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "🚫 Restaurante fechado! Funcionamos das 18:00 às 23:50",
            duration: 4000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    const existingItem = cart.find(item => item.name === name)

    if(existingItem){
        // se o item existe aumenta apenas a quantidade + 1
        existingItem.quantity += 1;

        }else{
        
            cart.push({
                name,
                price,
                quantity: 1,
                observation: '' // Campo para observação
            })      
        }
        
        updateCartModal()
}

// atualizar carrinho

function updateCartModal(){
 cartItemsContainer.innerHTML = "";
 let total = 0;

cart.forEach(item => {
    const cartItensElement = document.createElement("div");
    cartItensElement.classList.add("flex", "justify-between", "mb-4", "flex-col")

    cartItensElement.innerHTML = `
        <div class="border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
            <div>
                    <p class="font-medium text-lg">${item.name}</p>
                    <p class="text-gray-600">Qtd: ${item.quantity}</p>
                    <p class="font-medium text-green-600 mt-1">R$ ${item.price.toFixed(2)}</p>
            </div>
                <button class="remove-from-cart-bn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" data-name="${item.name}">
               Remover   
            </button>
            </div>
            
            <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Observação:</label>
                <textarea 
                    class="observation-input w-full border border-gray-300 rounded-md p-2 text-sm resize-none" 
                    data-name="${item.name}"
                    placeholder="Ex: Sem cebola, bem passado, etc..."
                    rows="2"
                >${item.observation || ''}</textarea>
            </div>
        </div>
    ` 
    
    total += item.price * item.quantity; 
    
    cartItemsContainer.appendChild(cartItensElement)


})

cartTotal.textContent = total.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"

});

cartCounter.innerHTML = cart.length;


}

// Função para remover o carrinho
cartItemsContainer.addEventListener("click", function (event){
    if(event.target.classList.contains("remove-from-cart-bn")){    
        const name = event.target.getAttribute("data-name") 
        
        removeItemCart(name);
    }
})

// Função para atualizar observações
document.addEventListener('input', function(event) {
    if(event.target.classList.contains('observation-input')) {
        const name = event.target.getAttribute('data-name');
        const observation = event.target.value;
        
        const item = cart.find(item => item.name === name);
        if(item) {
            item.observation = observation;
        }
    }
});

function removeItemCart(name){
const index = cart.findIndex(item => item.name === name);

if(index !== -1){
    const item = cart[index];
    
    if(item.quantity > 1){
        item.quantity -= 1;
        updateCartModal();
        return;
    }

    cart.splice(index, 1);
    updateCartModal();

}

}

addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;
    
    if(inputValue !== ""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")              
    }

})

// finalizar pedido 
checkoutBtn.addEventListener("click",async function(){ 
    
    const isOpen = await checkRestaurantOpen(); 
    if(!isOpen){
         
        Toastify({
            text: "RESTAURANTE FECHADO",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
            },

        }).showToast();

        return;
    }
    
    if(cart.length === 0) return;
    if(addressInput.value === ""){
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return;
    }
   
 // ENVIAR O PEDIDO PARA API DO WHATSAPP       

    const cartItems = cart.map((item) => { 
        const observation = item.observation ? `\n   Obs: ${item.observation}` : '';
        return (
            ` ${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price}${observation} |`
        )
        }).join("")

        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        const paymentText = {
            'dinheiro': '💵 Dinheiro',
            'pix': '📱 PIX', 
            'cartao': '💳 Cartão'
        };
        
        // Add change information for cash payment
        let paymentInfo = paymentText[selectedPayment];
        if(selectedPayment === 'dinheiro' && needsChange && moneyGivenInput.value) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const moneyGiven = parseFloat(moneyGivenInput.value);
            const change = moneyGiven - total;
            
            if(change >= 0) {
                paymentInfo += `\nValor recebido: R$ ${moneyGiven.toFixed(2)}\nTroco: R$ ${change.toFixed(2)}`;
            } else {
                paymentInfo += `\nValor recebido: R$ ${moneyGiven.toFixed(2)}\nValor insuficiente!`;
            }
        }
        
        const customerData = `\n\nCliente: ${customerName.value}\nTelefone: ${customerPhone.value}\nPonto de Referência: ${reference.value || 'Nenhum'}\nEndereço: ${addressInput.value}\nForma de Pagamento: ${paymentInfo}`;
        const message = encodeURIComponent(cartItems + customerData)
        const phone = "5528999221118"

        window.open(`https://wa.me/${phone}?text=${message}`, "_blank")

        cart = [];

        updateCartModal();
})

// verificar a hora e manipular o card de horario

async function checkRestaurantOpen(){
    // Try to get schedule from JSON file
    let schedule = {
        openingTime: '18:00',
        closingTime: '23:50',
        workingDays: [0, 1, 2, 3, 4, 5, 6],
        forceClose: false,
        maintenanceMode: false
    };
    
    try {
        const response = await fetch('./schedule.json');
        if (response.ok) {
            const data = await response.json();
            schedule = { ...schedule, ...data };
        }
    } catch (error) {
        console.log('Usando configurações padrão');
    }
    
    // Check if forced closed or in maintenance
    if (schedule.forceClose || schedule.maintenanceMode) {
        return false;
    }
    
    const data = new Date();
    const hora = data.getHours();
    const minuto = data.getMinutes();
    const diaSemana = data.getDay();
    
    // Check if today is a working day
    if (!schedule.workingDays.includes(diaSemana)) {
        return false;
    }
    
    // Parse opening and closing times
    const [openHour, openMinute] = schedule.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = schedule.closingTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    const currentTime = hora * 60 + minuto;
    
    // Check if current time is within working hours
    return currentTime >= openTime && currentTime <= closeTime;
}

// Update schedule display
async function updateScheduleDisplay() {
    let schedule = {
        openingTime: '18:00',
        closingTime: '23:50',
        workingDays: [0, 1, 2, 3, 4, 5, 6]
    };
    
    try {
        const response = await fetch('./schedule.json');
        if (response.ok) {
            const data = await response.json();
            schedule = { ...schedule, ...data };
        }
    } catch (error) {
        console.log('Usando configurações padrão');
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const workingDaysNames = schedule.workingDays.map(day => dayNames[day]);
    
    let scheduleText;
    if (schedule.workingDays.length === 7) {
        scheduleText = 'Todos os dias';
    } else if (schedule.workingDays.length === 1) {
        scheduleText = workingDaysNames[0];
    } else {
        scheduleText = workingDaysNames.join(', ');
    }
    
    const isOpen = await checkRestaurantOpen();
    let displayText;
    
    if (schedule.forceClose) {
        displayText = '🚫 Fechado temporariamente';
    } else if (schedule.maintenanceMode) {
        displayText = '🔧 Em manutenção';
    } else if (isOpen) {
        displayText = `✅ Aberto - ${scheduleText} ${schedule.openingTime} às ${schedule.closingTime}`;
    } else {
        displayText = `🚫 Fechado - ${scheduleText} ${schedule.openingTime} às ${schedule.closingTime}`;
    }
    
    document.getElementById('schedule-display').textContent = displayText;
}

// Initialize restaurant status
async function initializeRestaurantStatus() {
    const spanItem = document.getElementById("date-span");
    const isOpen = await checkRestaurantOpen();

    if(isOpen){
        spanItem.classList.remove("bg-red-500");
        spanItem.classList.add("bg-green-600");
    }else{
        spanItem.classList.remove("bg-green-600");
        spanItem.classList.add("bg-red-500");
    }

    // Update schedule display
    await updateScheduleDisplay();
}

// Initialize when page loads
initializeRestaurantStatus();

// Update status every minute
setInterval(async () => {
    await initializeRestaurantStatus();
}, 60000); // 60 seconds

// Step management functions
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    
    // Show current step
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
    // Update indicators
    for(let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`step-${i}-indicator`);
        const label = indicator.nextElementSibling;
        
        if(i <= step) {
            indicator.classList.remove('bg-gray-300', 'text-gray-600');
            indicator.classList.add('bg-green-500', 'text-white');
            label.classList.remove('text-gray-500');
            label.classList.add('text-gray-700');
        } else {
            indicator.classList.remove('bg-green-500', 'text-white');
            indicator.classList.add('bg-gray-300', 'text-gray-600');
            label.classList.remove('text-gray-700');
            label.classList.add('text-gray-500');
        }
    }
    
    // Update navigation buttons
    prevStepBtn.classList.toggle('hidden', step === 1);
    nextStepBtn.classList.toggle('hidden', step === 4);
    checkoutBtn.classList.toggle('hidden', step !== 4);
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return cart.length > 0;
        case 2:
            if(!customerName.value.trim()) {
                alert('Por favor, digite seu nome completo');
                customerName.focus();
                return false;
            }
            if(!customerPhone.value.trim()) {
                alert('Por favor, digite seu telefone');
                customerPhone.focus();
                return false;
            }
            return true;
        case 3:
            if(!addressInput.value.trim()) {
                addressWarn.classList.remove('hidden');
                addressInput.classList.add('border-red-500');
                addressInput.focus();
                return false;
            }
            return true;
        case 4:
            // Pagamento sempre tem uma opção selecionada (dinheiro por padrão)
            return true;
        default:
            return true;
    }
}

function resetSteps() {
    currentStep = 1;
    showStep(1);
    // Clear form data
    customerName.value = '';
    customerPhone.value = '';
    reference.value = '';
    addressInput.value = '';
    addressWarn.classList.add('hidden');
    addressInput.classList.remove('border-red-500');
}

// Payment option interactions
document.addEventListener('change', function(event) {
    if(event.target.name === 'payment') {
        // Update visual indicators
        document.querySelectorAll('.payment-option').forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const radioCircle = option.querySelector('.payment-radio');
            const dot = option.querySelector('.payment-dot');
            
            if(radio.checked) {
                radioCircle.classList.add('border-green-500');
                radioCircle.classList.remove('border-gray-300');
                dot.classList.remove('hidden');
                option.classList.add('border-green-500');
                option.classList.remove('border-gray-200');
            } else {
                radioCircle.classList.remove('border-green-500');
                radioCircle.classList.add('border-gray-300');
                dot.classList.add('hidden');
                option.classList.remove('border-green-500');
                option.classList.add('border-gray-200');
            }
        });
        
        // Show/hide sections based on payment method
        const changeSection = document.getElementById('change-section');
        const pixSection = document.getElementById('pix-section');
        
        if(event.target.value === 'dinheiro') {
            changeSection.classList.remove('hidden');
            pixSection.classList.add('hidden');
            updateOrderTotalDisplay();
        } else if(event.target.value === 'pix') {
            changeSection.classList.add('hidden');
            pixSection.classList.remove('hidden');
            // Reset change inputs when switching away from cash
            needsChange = false;
            changeInputs.classList.add('hidden');
            changeToggleIcon.classList.remove('border-green-500');
            changeToggleIcon.classList.add('border-gray-300');
            changeToggleDot.classList.add('hidden');
            changeToggleCard.classList.remove('border-green-500', 'bg-green-50');
            changeToggleCard.classList.add('border-gray-200');
            changeToggleArrow.innerHTML = '<i class="fa fa-chevron-right text-sm"></i>';
            moneyGivenInput.value = '';
        } else {
            changeSection.classList.add('hidden');
            pixSection.classList.add('hidden');
            // Reset change inputs when switching away from cash
            needsChange = false;
            changeInputs.classList.add('hidden');
            changeToggleIcon.classList.remove('border-green-500');
            changeToggleIcon.classList.add('border-gray-300');
            changeToggleDot.classList.add('hidden');
            changeToggleCard.classList.remove('border-green-500', 'bg-green-50');
            changeToggleCard.classList.add('border-gray-200');
            changeToggleArrow.innerHTML = '<i class="fa fa-chevron-right text-sm"></i>';
            moneyGivenInput.value = '';
        }
    }
});

// Change calculation system
const changeToggleCard = document.getElementById('change-toggle-card');
const changeToggleIcon = document.getElementById('change-toggle-icon');
const changeToggleDot = document.getElementById('change-toggle-dot');
const changeToggleArrow = document.getElementById('change-toggle-arrow');
const changeInputs = document.getElementById('change-inputs');
const moneyGivenInput = document.getElementById('money-given');
const orderTotalDisplay = document.getElementById('order-total-display');
const moneyGivenDisplay = document.getElementById('money-given-display');
const changeAmount = document.getElementById('change-amount');

let needsChange = false;

// Toggle change inputs visibility
changeToggleCard.addEventListener('click', function() {
    needsChange = !needsChange;
    
    if(needsChange) {
        // Ativar troco
        changeInputs.classList.remove('hidden');
        changeToggleIcon.classList.add('border-green-500');
        changeToggleIcon.classList.remove('border-gray-300');
        changeToggleDot.classList.remove('hidden');
        changeToggleCard.classList.add('border-green-500', 'bg-green-50');
        changeToggleCard.classList.remove('border-gray-200');
        changeToggleArrow.innerHTML = '<i class="fa fa-chevron-down text-sm"></i>';
        updateOrderTotalDisplay();
    } else {
        // Desativar troco
        changeInputs.classList.add('hidden');
        changeToggleIcon.classList.remove('border-green-500');
        changeToggleIcon.classList.add('border-gray-300');
        changeToggleDot.classList.add('hidden');
        changeToggleCard.classList.remove('border-green-500', 'bg-green-50');
        changeToggleCard.classList.add('border-gray-200');
        changeToggleArrow.innerHTML = '<i class="fa fa-chevron-right text-sm"></i>';
        moneyGivenInput.value = '';
        updateChangeDisplay();
    }
});

// Calculate change when money given changes
moneyGivenInput.addEventListener('input', function() {
    updateChangeDisplay();
});

// Update order total display
function updateOrderTotalDisplay() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotalDisplay.textContent = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Update change calculation display
function updateChangeDisplay() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const moneyGiven = parseFloat(moneyGivenInput.value) || 0;
    
    // Update money given display
    moneyGivenDisplay.textContent = moneyGiven.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    // Calculate and display change
    const change = moneyGiven - total;
    if(change >= 0) {
        changeAmount.textContent = change.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        changeAmount.classList.remove('text-red-600');
        changeAmount.classList.add('text-green-600');
    } else {
        changeAmount.textContent = 'Valor insuficiente';
        changeAmount.classList.remove('text-green-600');
        changeAmount.classList.add('text-red-600');
    }
}

// PIX copy functionality
const copyPixBtn = document.getElementById('copy-pix-btn');
const pixKey = '5528999221118'; // Chave PIX (número do celular)

copyPixBtn.addEventListener('click', async function() {
    try {
        await navigator.clipboard.writeText(pixKey);
        
        // Visual feedback
        const originalText = copyPixBtn.innerHTML;
        copyPixBtn.innerHTML = '<i class="fa fa-check"></i> Copiado!';
        copyPixBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        copyPixBtn.classList.add('bg-green-500');
        
        // Show toast notification
        Toastify({
            text: "Chave PIX copiada! Cole no seu app de pagamento",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#10b981",
            },
        }).showToast();
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyPixBtn.innerHTML = originalText;
            copyPixBtn.classList.remove('bg-green-500');
            copyPixBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }, 2000);
        
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = pixKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        Toastify({
            text: "Chave PIX copiada! Cole no seu app de pagamento",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#10b981",
            },
        }).showToast();
    }
});

// Initialize steps and payment options
showStep(1);
// Initialize first payment option as selected
document.querySelector('input[name="payment"][value="dinheiro"]').checked = true;
document.querySelector('input[name="payment"][value="dinheiro"]').dispatchEvent(new Event('change'));

// Update order total when cart changes
function updateCartModal(){
 cartItemsContainer.innerHTML = "";
 let total = 0;

cart.forEach(item => {
    const cartItensElement = document.createElement("div");
    cartItensElement.classList.add("flex", "justify-between", "mb-4", "flex-col")

    cartItensElement.innerHTML = `
        <div class="border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <p class="font-medium text-lg">${item.name}</p>
                    <p class="text-gray-600">Qtd: ${item.quantity}</p>
                    <p class="font-medium text-green-600 mt-1">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-bn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" data-name="${item.name}">
                   Remover   
                </button>
            </div>
            
            <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Observação:</label>
                <textarea 
                    class="observation-input w-full border border-gray-300 rounded-md p-2 text-sm resize-none" 
                    data-name="${item.name}"
                    placeholder="Ex: Sem cebola, bem passado, etc..."
                    rows="2"
                >${item.observation || ''}</textarea>
            </div>
        </div>
    ` 
    
    total += item.price * item.quantity; 
    
    cartItemsContainer.appendChild(cartItensElement)

})

cartTotal.textContent = total.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"

});

cartCounter.innerHTML = cart.length;

// Update change calculation if on payment step
if(currentStep === 4) {
    updateOrderTotalDisplay();
    updateChangeDisplay();
}

}
