const topCard = document.querySelector('.top-card');
const bottomCard = document.querySelector('.bottom-card');

//The *top* value returned by this function is the distance from the top of the document to the top edge of the element. 
//Returns the document-relative top and left position of an element.
function getElementTopPosition(element){
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
    };
}
//The *bottom* value returned by this function is the distance from the top of the document to the bottom edge of the element.
//Returns the document-relative bottom and left position of an element.
function getElementBottomPosition(element){
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    return{
        bottom: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
    };
}

// Calculates the vertical offset needed to align the bottom of element1 with the bottom of element2.
// Returns a negative value if element1's bottom is below element2's bottom, or 0 if not.
function matchBottomToBottom(element1, element2){
    const bottomCard = getElementBottomPosition(element1);
    const topCard = getElementBottomPosition(element2);
    return bottomCard.bottom > topCard.bottom ? -(bottomCard.bottom - topCard.bottom) : 0;
}
    
// Calculates the vertical offset to align the top of element1 with the bottom of element2, considering their relative positions.
function matchTopToBottom(element1, element2){
    const bottomCardTop = getElementTopPosition(element1).top;
    const bottomCardBottom = getElementBottomPosition(element2).bottom;
    const topCardTop = getElementTopPosition(element2).top;
    const topCardBottom = getElementBottomPosition(element2).bottom;
    if(bottomCardTop.top < topCardTop.top){
        // element1's top is above element2's top, align element1's top with element2's bottom.
        //indicative that: bottomCardBottom === topCardBottom
        // return -(topCardTop - topCardBottom); //alternative line of code
        return -(topCardTop - bottomCardBottom);
    }
    else{
        if(bottomCardTop === topCardTop){
            // element1's top is at the same position as element2's top, align element1's top with element2's bottom.
            // return bottomCardBottom - bottomCardTop; //alternative line of code
            return topCardBottom - bottomCardTop;
        }
        else{ 
            //element1's top is below element2's top, align element1's top with element2's bottom. 
            //bottomCardBottom.bottom === topCardBottom.bottom

            return (bottomCardBottom - topCardTop);
        }
    }
}

// Moves element1 vertically based on its initial or current position relative to element2. 
function moveElementUp(element1, element2){
    if(element1.classList.contains('initial')){
        //Initial tells us topCard.top === bottomCard.top
        const diff = matchBottomToBottom(element1, element2);
        element1.style.transform = `translateY(${diff}px)`; 
    }
//Else this will translate a different calculated position
    else{
        const element1Top = getElementTopPosition(bottomCard).top;
        const element2Top = getElementTopPosition(topCard).top;
        //Difference of initial state
        let diff = element1Top - element2Top;
        //Added to any differences matchBottomToBottom might have
        diff += matchBottomToBottom(element1, element2);
        element1.style.transform = `translateY(${diff}px)`;
    }
}
//Moves element1 vertically downwards by aligning its top with element2's bottom.
function moveElementDown(element1, element2){
    let diff = matchTopToBottom(element1, element2); 
    element1.style.transform = `translateY(${diff}px)`;
}

//Program Start Point:------------------------------------------------
if(bottomCard.classList.contains('initial')){
    //Initialize bottomCard position
    moveElementUp(bottomCard, topCard);
    bottomCard.classList.toggle('initial');
    bottomCard.classList.toggle('closed');
}

const dropTrigger = document.querySelector('.drop-trigger');
dropTrigger.addEventListener('click', () => {
    dropTrigger.disabled = true;

    if(bottomCard.classList.contains('closed')){
        //Move bottomCard downwards
        bottomCard.classList.toggle('closed');
        bottomCard.classList.toggle('open');
        bottomCard.style.transition = 'transform 2s ease-in-out';
        moveElementDown(bottomCard, topCard);
    }
    else{
        //Move bottomCard upwards
        bottomCard.classList.toggle('open');
        bottomCard.classList.toggle('closed');
        bottomCard.style.transition = 'transform 2s ease-in-out';
        moveElementUp(bottomCard, topCard);
    }
    setTimeout(() =>{
        dropTrigger.disabled = false;
    }, 2000); //2000ms matches transition duration
});
