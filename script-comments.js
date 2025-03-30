document.addEventListener('DOMContentLoaded', function(){
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
    
    // Calculates the vertical offset needed to align the bottom-edge of element1 with the bottom-edge of element2.
    // Returns a negative value if element1's bottom-edge is below element2's bottom-edge, or if not, 0.
    function matchBottomToBottom(element1, element2){
        const bottomCard = getElementBottomPosition(element1);
        const topCard = getElementBottomPosition(element2);
        if((element1.classList.contains('initial') || element1.classList.contains('closed')) && bottomCard.bottom < topCard.bottom){
            //'initial' is associated with default positioning
            //'closed' is associated with window-resizing
            return topCard.bottom - bottomCard.bottom;
        }
        return bottomCard.bottom > topCard.bottom ? topCard.bottom - bottomCard.bottom : 0;
    }
        
    // Calculates the vertical offset to align the top-edge of element1 with the bottom-edge of element2, considering their relative positions.
    //"match top of bottomCard(element1) to bottom of topCard(element2)"
    function matchTopToBottom(element1, element2){
        const bottomCardTop = getElementTopPosition(element1).top;
        const bottomCardBottom = getElementBottomPosition(element2).bottom;
        const topCardTop = getElementTopPosition(element2).top;
        const topCardBottom = getElementBottomPosition(element2).bottom;
        if(bottomCardTop < topCardTop){
            // element1's top-edge is above element2's top-edge, 
            // align element1's top-edge with element2's bottom-edge.
            // indicative that: bottomCardBottom === topCardBottom
            return -(topCardTop - bottomCardBottom);
        }
        else{
            if(bottomCardTop === topCardTop){
                // element1's top-edge is at the same position as element2's top-edge, 
                // align element1's top-edge with element2's bottom-edge.
                return topCardBottom - bottomCardTop;
            }
            else{ 
                // element1's top-edge is below element2's top-edge, 
                // align element1's top-edge with element2's bottom-edge. 
                //bottomCardBottom.bottom === topCardBottom.bottom
                return bottomCardBottom - topCardTop;
            }
        }
    }
      
    // Moves element1 vertically based on its initial or current position relative to element2. 
    function moveElementUp(element1, element2, windowEvent){
        //"windowEvent" is *only* present when window is resized

        if(element1.classList.contains('initial')){
            //Initial tells us topCard.top === bottomCard.top because of CSS position absolute
            const diff = matchBottomToBottom(element1, element2);
            //if element1 is overflowing, translate it so element1.bottom === element2.bottom
            element1.style.transform = `translateY(${diff}px)`; 
            if(diff < 0){
            //if element1 overflows, the top edge will overflow after translate, clip off excess
                const clipHeight = Math.abs(diff);
                element1.style.clipPath = `inset(${clipHeight}px 0 0 0)`;
            }
        }
    //Else this will translate a different calculated position
        else{
            const element1Top = getElementTopPosition(bottomCard).top;
            const element2Top = getElementTopPosition(topCard).top;
            //Difference of initial state
            let diff = element1Top - element2Top;
            //Added to any differences matchBottomToBottom might have

            diff += matchBottomToBottom(element1, element2);
            if(!windowEvent || (windowEvent && element1.classList.contains('closed') && element1Top > element2Top)){
                //when element1 size < element2 size
                element1.style.transform = `translateY(${diff}px)`; 
            }

            const clipHeight = Math.abs(diff);
            if(diff < 0){
                if(windowEvent && element1.classList.contains('closed')){
                    //occurs when the content of the bottom element overflows
                    //element1 size > element2 size
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
                    //otherwise, it's a button click
                    //element1 size > element2 size
                    setTimeout(() => {
                        element1.style.clipPath = `inset(${clipHeight}px 0 0 0)`;
                    }, 1000); // Adjust this delay to match your transition timing
                    return;
                }
            }

            if(windowEvent && element1.classList.contains('open') && diff > 0){
                //element1 size < element2 size
                diff = matchTopToBottom(element1, element2);
                element1.style.transform = `translateY(${diff}px)`;
            }

            else{
                //element1 size < element2 size && .contains('closed') 
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


    //Moves element1 vertically downwards by aligning its top-edge with element2's bottom-edge.
    function moveElementDown(element1, element2){
        let diff = matchTopToBottom(element1, element2); 
        element1.style.transform = `translateY(${diff}px)`;
        setTimeout(() => {
            element1.style.clipPath = `inset(0 0 0 0)`;
        }, 1000); // Adjust this delay to match your transition timing
    }

    //Any sort of window resizing will be handled here.
    function handleResize(element1, element2){
        const element1Top = getElementTopPosition(element1).top;
        const element2Bottom = getElementBottomPosition(element2).bottom;
        const windowEvent = true;
        element1.style.transition = `transform 0s`;
        if(element1.classList.contains('closed')){
            moveElementUp(element1, element2, windowEvent);
        }
        else{ //element1.classList.contains('open')
            if(element1Top < element2Bottom){
                //meaning element1 is being overlapped
                moveElementDown(element1, element2);
            }
            else{
                //meaning they're apart (element1Top > element2Bottom) 
                moveElementUp(element1, element2, windowEvent); 
            }
        }
    }

    window.addEventListener('resize', () => handleResize(bottomCard, topCard));
    
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
});
