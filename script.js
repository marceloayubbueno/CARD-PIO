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
cartBtn.addEventListener("click", function() {
    // Verificar se o restaurante está aberto
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "🚫 Restaurante fechado! Funcionamos domingo das 13:00 às 21:30",
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

menu.addEventListener("click", function(event){
   

   let parentButton = event.target.closest(".add-to-cart-btn")

    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price")
    )
      
    addToCart(name,price)

    }

})

// FUNÇÃO PARA ADICIONAR NO CARRINHO 
function addToCart(name, price){
    // Verificar se o restaurante está aberto
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "🚫 Restaurante fechado! Funcionamos domingo das 13:00 às 21:30",
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
checkoutBtn.addEventListener("click",function(){ 
    
    const isOpen = checkRestaurantOpen(); 
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

function checkRestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    const minuto = data.getMinutes();
    const diaSemana = data.getDay(); // 0 = Domingo
    
    // Horário fixo: Domingo das 13:00 às 21:30
    const openingTime = 13 * 60; // 13:00 em minutos
    const closingTime = 21 * 60 + 30; // 21:30 em minutos
    const currentTime = hora * 60 + minuto;
    
    // Verificar se é domingo e está no horário
    return diaSemana === 0 && currentTime >= openingTime && currentTime <= closingTime;
}

// Update schedule display
function updateScheduleDisplay() {
    const isOpen = checkRestaurantOpen();
    let statusText;
    let scheduleInfo;
    
    if (isOpen) {
        statusText = '✅ Aberto';
        scheduleInfo = 'Horário: Domingo das 13:00 às 21:30';
    } else {
        statusText = '🚫 Fechado';
        scheduleInfo = 'Horário: Domingo das 13:00 às 21:30';
    }
    
    // Criar HTML com duas linhas
    const displayHTML = `
        <div class="text-center">
            <div class="text-lg font-bold">${statusText}</div>
            <div class="text-sm opacity-90 mt-1">${scheduleInfo}</div>
        </div>
    `;
    
    document.getElementById('schedule-display').innerHTML = displayHTML;
}

// Initialize restaurant status
function initializeRestaurantStatus() {
    const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if(isOpen){
        spanItem.classList.remove("bg-gradient-to-r", "from-red-500", "to-red-600");
        spanItem.classList.add("bg-gradient-to-r", "from-green-500", "to-green-600");
}else{
        spanItem.classList.remove("bg-gradient-to-r", "from-green-500", "to-green-600");
        spanItem.classList.add("bg-gradient-to-r", "from-red-500", "to-red-600");
    }

    // Update schedule display
    updateScheduleDisplay();
}

// Initialize when page loads
initializeRestaurantStatus();

// Update status every minute
setInterval(() => {
    initializeRestaurantStatus();
}, 60000); // 60 seconds

// Step management functions
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    
    // Show current step
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
    // Initialize payment elements when reaching step 4
    if (step === 4) {
        // Force immediate initialization
        initializeChangeElements();
        setupChangeToggleListener();
        setupMoneyInputListener();
        
        // Force trigger change event for dinheiro if it's checked
        const dinheiroRadio = document.querySelector('input[name="payment"][value="dinheiro"]');
        if (dinheiroRadio && dinheiroRadio.checked) {
            // Force show dinheiro section immediately
            const changeSection = document.getElementById('change-section');
            if (changeSection) {
                changeSection.classList.remove('hidden');
            }
            // Then trigger the change event
            setTimeout(() => {
                dinheiroRadio.dispatchEvent(new Event('change'));
            }, 10);
        }
    }
    
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

// Payment option interactions - ULTRA SIMPLE
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
            if (changeInputs) changeInputs.classList.add('hidden');
            if (changeToggleIcon) {
                changeToggleIcon.classList.remove('border-green-500');
                changeToggleIcon.classList.add('border-gray-300');
            }
            if (changeToggleDot) changeToggleDot.classList.add('hidden');
            if (changeToggleCard) {
                changeToggleCard.classList.remove('border-green-500', 'bg-green-50');
                changeToggleCard.classList.add('border-gray-200');
            }
            if (changeToggleArrow) changeToggleArrow.innerHTML = '<i class="fa fa-chevron-right text-sm"></i>';
            if (moneyGivenInput) moneyGivenInput.value = '';
        } else {
            changeSection.classList.add('hidden');
            pixSection.classList.add('hidden');
            // Reset change inputs when switching away from cash
            needsChange = false;
            if (changeInputs) changeInputs.classList.add('hidden');
            if (changeToggleIcon) {
                changeToggleIcon.classList.remove('border-green-500');
                changeToggleIcon.classList.add('border-gray-300');
            }
            if (changeToggleDot) changeToggleDot.classList.add('hidden');
            if (changeToggleCard) {
                changeToggleCard.classList.remove('border-green-500', 'bg-green-50');
                changeToggleCard.classList.add('border-gray-200');
            }
            if (changeToggleArrow) changeToggleArrow.innerHTML = '<i class="fa fa-chevron-right text-sm"></i>';
            if (moneyGivenInput) moneyGivenInput.value = '';
        }
    }
});

// Change calculation system
let changeToggleCard, changeToggleIcon, changeToggleDot, changeToggleArrow;
let changeInputs, moneyGivenInput, orderTotalDisplay, moneyGivenDisplay, changeAmount;
let needsChange = false;

// Initialize change calculation elements
function initializeChangeElements() {
    changeToggleCard = document.getElementById('change-toggle-card');
    changeToggleIcon = document.getElementById('change-toggle-icon');
    changeToggleDot = document.getElementById('change-toggle-dot');
    changeToggleArrow = document.getElementById('change-toggle-arrow');
    changeInputs = document.getElementById('change-inputs');
    moneyGivenInput = document.getElementById('money-given');
    orderTotalDisplay = document.getElementById('order-total-display');
    moneyGivenDisplay = document.getElementById('money-given-display');
    changeAmount = document.getElementById('change-amount');
}

// Toggle change inputs visibility
function setupChangeToggleListener() {
    if (changeToggleCard) {
        // Remove any existing listeners first
        changeToggleCard.onclick = null;
        // Add new listener
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
    }
}

// Calculate change when money given changes
function setupMoneyInputListener() {
    if (moneyGivenInput) {
        moneyGivenInput.addEventListener('input', function() {
            updateChangeDisplay();
        });
    }
}

// Update order total display
function updateOrderTotalDisplay() {
    if (orderTotalDisplay) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderTotalDisplay.textContent = total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
}

// Update change calculation display
function updateChangeDisplay() {
    if (!moneyGivenInput || !moneyGivenDisplay || !changeAmount) return;
    
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

// Direct handler for dinheiro click - GARANTE QUE FUNCIONE
function handleDinheiroClick() {
    console.log('Dinheiro clicked directly!');
    
    // Force show dinheiro section
    const changeSection = document.getElementById('change-section');
    const pixSection = document.getElementById('pix-section');
    
    if (changeSection) {
        changeSection.classList.remove('hidden');
        console.log('Dinheiro section shown');
    }
    if (pixSection) {
        pixSection.classList.add('hidden');
    }
    
    // Update visual indicators
    document.querySelectorAll('.payment-option').forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        const radioCircle = option.querySelector('.payment-radio');
        const dot = option.querySelector('.payment-dot');
        
        if(radio && radio.value === 'dinheiro') {
            radioCircle.classList.add('border-green-500');
            radioCircle.classList.remove('border-gray-300');
            dot.classList.remove('hidden');
            option.classList.add('border-green-500');
            option.classList.remove('border-gray-200');
        } else if(radio) {
            radioCircle.classList.remove('border-green-500');
            radioCircle.classList.add('border-gray-300');
            dot.classList.add('hidden');
            option.classList.remove('border-green-500');
            option.classList.add('border-gray-200');
        }
    });
    
    // Initialize change elements if not already done
    initializeChangeElements();
    setupChangeToggleListener();
    setupMoneyInputListener();
    
    updateOrderTotalDisplay();
}

// Initialize payment system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize first payment option as selected
    const dinheiroRadio = document.querySelector('input[name="payment"][value="dinheiro"]');
    if (dinheiroRadio) {
        dinheiroRadio.checked = true;
        
        // Initialize elements immediately
        initializeChangeElements();
        setupChangeToggleListener();
        setupMoneyInputListener();
        
        // Force show dinheiro section immediately
        const changeSection = document.getElementById('change-section');
        if (changeSection) {
            changeSection.classList.remove('hidden');
        }
        
        // Then trigger change event
        setTimeout(() => {
            dinheiroRadio.dispatchEvent(new Event('change'));
        }, 10);
    }
});

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
