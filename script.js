document.addEventListener('DOMContentLoaded', function(){
    const topCard = document.querySelector('.top-card');
    const bottomCard = document.querySelector('.bottom-card');

    function getElementTopPosition(element){
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        return {
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
        if((element1.classList.contains('initial') || element1.classList.contains('closed')) && bottomCard.bottom < topCard.bottom){
            return topCard.bottom - bottomCard.bottom;
        }
        return bottomCard.bottom > topCard.bottom ? topCard.bottom - bottomCard.bottom : 0;
    }

    function matchTopToBottom(element1, element2){
        const bottomCardTop = getElementTopPosition(element1).top;
        const bottomCardBottom = getElementBottomPosition(element2).bottom;
        const topCardTop = getElementTopPosition(element2).top;
        const topCardBottom = getElementBottomPosition(element2).bottom;
        if(bottomCardTop < topCardTop){
            return -(topCardTop - bottomCardBottom);
        }
        else{
            if(bottomCardTop === topCardTop){
                return topCardBottom - bottomCardTop;
            }
            else{ 
                return bottomCardBottom - topCardTop;
            }
        }
    } 
    function moveElementUp(element1, element2, windowEvent){

        if(element1.classList.contains('initial')){
            const diff = matchBottomToBottom(element1, element2);
            element1.style.transform = `translateY(${diff}px)`; 
            if(diff < 0){
                const clipHeight = Math.abs(diff);
                element1.style.clipPath = `inset(${clipHeight}px 0 0 0)`;
            }
        }
        else{
            const element1Top = getElementTopPosition(bottomCard).top;
            const element2Top = getElementTopPosition(topCard).top;
            let diff = element1Top - element2Top;

            diff += matchBottomToBottom(element1, element2);
            if(!windowEvent || (windowEvent && element1.classList.contains('closed') && element1Top > element2Top)){
                element1.style.transform = `translateY(${diff}px)`; 
            }

            const clipHeight = Math.abs(diff);
            if(diff < 0){
                if(windowEvent && element1.classList.contains('closed')){
                    element1.style.transform = `translateY(${diff}px)`;
                    element1.style.clipPath = `inset(${clipHeight}px 0 0 0)`;
                    return;
                }
                else{
                    if(windowEvent){
                        diff = matchTopToBottom(element1, element2);
                        element1.style.transform = `translateY(${diff}px)`;
                        return;
                    }
                    setTimeout(() => {
                        element1.style.clipPath = `inset(${clipHeight}px 0 0 0)`;
                    }, 1000); 
                    return;
                }
            }

            if(windowEvent && element1.classList.contains('open') && diff > 0){
                diff = matchTopToBottom(element1, element2);
                element1.style.transform = `translateY(${diff}px)`;
            }

            else{
                const element1Bottom = getElementBottomPosition(element1).bottom;
                const element2Bottom = getElementBottomPosition(element2).bottom;
                if(element1Bottom < element2Bottom && windowEvent){
                    diff = matchBottomToBottom(element1, element2)
                    element1.style.transform = `translateY(${diff}px)`;
                    return;
                }
            }
        }
    }

    function moveElementDown(element1, element2){
        let diff = matchTopToBottom(element1, element2); 
        element1.style.transform = `translateY(${diff}px)`;
        setTimeout(() => {
            element1.style.clipPath = `inset(0 0 0 0)`;
        }, 1000); 
    }

    function handleResize(element1, element2){
        const element1Top = getElementTopPosition(element1).top;
        const element2Bottom = getElementBottomPosition(element2).bottom;
        const windowEvent = true;
        element1.style.transition = `transform 0s`;
        if(element1.classList.contains('closed')){
            moveElementUp(element1, element2, windowEvent);
        }
        else{ 
            if(element1Top < element2Bottom){
                moveElementDown(element1, element2);
            }
            else{
                moveElementUp(element1, element2, windowEvent); 
            }
        }
    }

    window.addEventListener('resize', () => handleResize(bottomCard, topCard));
    
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
});
