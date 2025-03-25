const topCard = document.querySelector('.top-card');
const bottomCard = document.querySelector('.bottom-card');

function getElementTopPosition(element){
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
    return{
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
    };
}

function getElementBottomPosition(element){
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    return{
        bottom: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
    };
}

function matchBottomToBottom(element1, element2){
    const bottomCard = getElementBottomPosition(element1);
    const topCard = getElementBottomPosition(element2);
    return bottomCard.bottom > topCard.bottom ? -(bottomCard.bottom - topCard.bottom) : 0;
}
    
function matchTopToBottom(element1, element2){
    const bottomCardTop = getElementTopPosition(element1).top;
    const bottomCardBottom = getElementBottomPosition(element2).bottom;
    const topCardTop = getElementTopPosition(element2).top;
    const topCardBottom = getElementBottomPosition(element2).bottom;
    if(bottomCardTop.top < topCardTop.top){
        return -(topCardTop - bottomCardBottom);
    }
    else{
        if(bottomCardTop === topCardTop){
            return topCardBottom - bottomCardTop;
        }
        else{ 
            return (bottomCardBottom - topCardTop);
        }
    }
}
function moveElementUp(element1, element2){
    if(element1.classList.contains('initial')){
        const diff = matchBottomToBottom(element1, element2);
        element1.style.transform = `translateY(${diff}px)`; 
    }
    else{
        const element1Top = getElementTopPosition(bottomCard).top;
        const element2Top = getElementTopPosition(topCard).top;
        let diff = element1Top - element2Top;
        diff += matchBottomToBottom(element1, element2);
        element1.style.transform = `translateY(${diff}px)`;
    }
}
function moveElementDown(element1, element2){
    let diff = matchTopToBottom(element1, element2); 
    element1.style.transform = `translateY(${diff}px)`;
}

if(bottomCard.classList.contains('initial')){
    moveElementUp(bottomCard, topCard);
    bottomCard.classList.toggle('initial');
    bottomCard.classList.toggle('closed');
}

const dropTrigger = document.querySelector('.drop-trigger');
dropTrigger.addEventListener('click', () => {
    dropTrigger.disabled = true;

    if(bottomCard.classList.contains('closed')){
        bottomCard.classList.toggle('closed');
        bottomCard.classList.toggle('open');
        bottomCard.style.transition = 'transform 2s ease-in-out';
        moveElementDown(bottomCard, topCard);
    }
    else{
        bottomCard.classList.toggle('open');
        bottomCard.classList.toggle('closed');
        bottomCard.style.transition = 'transform 2s ease-in-out';
        moveElementUp(bottomCard, topCard);
    }
    setTimeout(() =>{
        dropTrigger.disabled = false;
    }, 2000); 
});