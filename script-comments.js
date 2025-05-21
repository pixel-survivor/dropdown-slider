document.addEventListener('DOMContentLoaded', function(){
    const cardGroups = [];
    const topCardTranslations = [];
    const bottomCardTranslations = [];
    const topCards = document.querySelectorAll('#cardcontainer > .top-card');
    const cardContainer = document.getElementById('cardcontainer');

    // Animation configuration
    const ANIMATION_DURATION = 1400; // milliseconds
    const CLIP_PATH_DURATION = 1200; // milliseconds for clip-path animations
    const EASING = 'cubic-bezier(0.25, 1, 0.5, 1)'; // More natural easing function

    // Define transitions
    const cardTransition = `transform ${ANIMATION_DURATION}ms ${EASING}`;
    const clipTransition = `clip-path ${CLIP_PATH_DURATION}ms ${EASING}`;
    const containerTransition = `height ${ANIMATION_DURATION}ms ${EASING}`;

    //Set the margin-bottom of last top-card to 0
    if(topCards.length > 0){
        const lastTopCard = topCards[topCards.length-1];
        lastTopCard.style.marginBottom = '0px';
    }

    function getElementPosition(element){
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        return{
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
        };
    }

    for (let i = 1; i <= topCards.length; i++){
        const topCardId = `top-card-${i}`;
        const bottomCardId = `bottom-card-${i}`;
        const dropTriggerId = `drop-trigger-${i}`;

        const topCard = document.getElementById(topCardId);
        const bottomCard = document.getElementById(bottomCardId);
        const dropTrigger = document.getElementById(dropTriggerId);

        if(topCard && bottomCard && dropTrigger){
            const cardGroup = {
                topCard: topCard,
                bottomCard: bottomCard,
                dropTrigger: dropTrigger,
                index: i - 1,
                getTopCardPosition: function(){
                    return getElementPosition(this.topCard); //returns position relative to document: {top: #px, bottom: #px}
                },
                getTopCardContainerPosition: function(){
                    return{
                        top: this.getTopCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getTopCardPosition().bottom - getElementPosition(cardContainer).top,
                    };
                },
                getBottomCardPosition: function(){
                    return getElementPosition(this.bottomCard);
                },
                getBottomCardContainerPosition: function(){
                    return{
                        top: this.getBottomCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getBottomCardPosition().bottom - getElementPosition(cardContainer).top,
                    };
                },
            };

            cardGroups.push(cardGroup);

            dropTrigger.addEventListener('click', function(){
                console.log(`Button ${dropTriggerId.split('-').pop()} clicked!`);
                toggleState(cardGroups[cardGroup.index]);
            });

            //Check if the cardContainer is set to flex-direction: column/row
            const computedStyle = window.getComputedStyle(cardContainer);
            if(computedStyle.flexDirection === 'column'){
                // Pre-position all bottom cards in their closed state
                bottomCard.classList.add('closed');
                
                // Initialize the default position of each bottomCard
                const translationValue = cardGroups[cardGroup.index].getTopCardContainerPosition().bottom - cardGroups[cardGroup.index].bottomCard.getBoundingClientRect().height;
                
                // Set initial transform and avoid transitions during setup
                cardGroup.bottomCard.style.transition = 'none';
                cardGroup.bottomCard.style.transform = `translateY(${translationValue}px)`;
                
                // Setup future transitions (will be applied after visibility)
                setTimeout(() => {
                    cardGroup.bottomCard.style.transition = `${cardTransition}, ${clipTransition}`;
                    cardGroup.topCard.style.transition = cardTransition;
                }, 0);

                // Calculate initial clip-path value
                const clipAmount = calculateClipAmount(cardGroup);
                cardGroup.bottomCard.style.clipPath = `inset(${clipAmount}px 0 0 0)`;

                // Push the translationValue for later changes
                bottomCardTranslations.push(translationValue);
                topCardTranslations.push(0); // Initialize 0 for the topCards for later use
            }
            else{
                console.log("Flex-Direction: Row");
            }
        } 
        else{
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }

    // Calculate proper clip amount based on card heights
    function calculateClipAmount(cardGroup){
        const topCardHeight = cardGroup.topCard.getBoundingClientRect().height;
        const bottomCardHeight = cardGroup.bottomCard.getBoundingClientRect().height;
        
        if(cardGroup.bottomCard.classList.contains('closed')){
            return bottomCardHeight - topCardHeight > 0 ? bottomCardHeight - topCardHeight : 0;
        } 
        else{
            return 0;
        }
    }

    console.log("Initialized bottomCardTranslations[]:",bottomCardTranslations); //log the bottomCardTranslations array after initializing
    console.log("Initialized topCardTranslations[]:", topCardTranslations); //log the topCardTranslations array after initializing

    function toggleState(cardGroup){
        cardGroup.dropTrigger.disabled = true;
        
        // Store initial heights and dimensions for calculations
        const initialCardHeights = storeInitialHeights();
        
        // Toggle the card state
        const isOpening = cardGroup.bottomCard.classList.contains('closed');
        
        if(isOpening){
            console.log("Opening the card...");
            cardGroup.bottomCard.classList.remove('closed');
            cardGroup.bottomCard.classList.add('open');
            expandCard(cardGroup, initialCardHeights);
        } 
        else{
            console.log("Closing the card...");
            cardGroup.bottomCard.classList.remove('open');
            cardGroup.bottomCard.classList.add('closed');
            collapseCard(cardGroup, initialCardHeights);
        }
        
        // Re-enable the trigger button after animation completes
        setTimeout(() => {
            cardGroup.dropTrigger.disabled = false;
        }, ANIMATION_DURATION);
    }
    
    // Store initial heights of all cards for precise calculations
    function storeInitialHeights(){
        const heights = {};
        cardGroups.forEach(group => {
            const index = group.index;
            heights[`top-${index}`] = group.topCard.getBoundingClientRect().height;
            heights[`bottom-${index}`] = group.bottomCard.getBoundingClientRect().height;
        });
        return heights;
    }
    
    // Expand the card and handle animations
    function expandCard(cardGroup, initialHeights){
        // Update translations
        const bottomCardHeight = initialHeights[`bottom-${cardGroup.index}`];
        bottomCardTranslations[cardGroup.index] += bottomCardHeight;
        
        // Calculate which cards need to be moved
        const totalRecursions = checkForCollision(cardGroup);
        
        // Animate clip-path to reveal content
        animateClipPath(cardGroup, true);
        
        // Apply translations to all cards that need to move
        translateElement(cardGroup, totalRecursions);
        
        // Check margins after animation completes
        setTimeout(() => {
            getMarginBottoms(cardGroups);
        }, ANIMATION_DURATION + 100);
    }
    
    // Collapse the card and handle animations
    function collapseCard(cardGroup, initialHeights){
        // Update translations
        const bottomCardHeight = initialHeights[`bottom-${cardGroup.index}`];
        bottomCardTranslations[cardGroup.index] -= bottomCardHeight;
        
        // Calculate which cards need to be moved
        const totalRecursions = collapseElements(cardGroup);
        
        // Animate clip-path to hide content
        animateClipPath(cardGroup, false);
        
        // Apply translations to affected cards
        translateElement(cardGroup, totalRecursions);
    }

    function translateElement(cardGroup, totalRecursions){
        // If no recursions, only move the bottom card
        if(totalRecursions === 0){
            cardGroup.bottomCard.style.transform = `translateY(${bottomCardTranslations[cardGroup.index]}px)`;
            return;
        }
        
        // If recursions reached end of array, move all affected cards
        if((cardGroup.index + totalRecursions) >= (cardGroups.length - 1)){
            for (let i = cardGroup.index; i < cardGroups.length; i++){
                cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
            }
            return;
        }
        
        // Otherwise, move only the cards that were affected
        for (let i = cardGroup.index; i <= cardGroup.index + totalRecursions; i++){
            cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
            if(i > cardGroup.index){
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
            }
        }
    }

    function checkForCollision(cardGroup, translationValue = 0, depth = 0){
        // Get positions
        const currentBottomCardBottom = cardGroup.getBottomCardContainerPosition().bottom;
        const bottomCardHeight = cardGroup.bottomCard.getBoundingClientRect().height;
        
        // Calculate new position
        let newBottomCardBottom = translationValue ? 
            currentBottomCardBottom + translationValue : 
            currentBottomCardBottom + bottomCardHeight;
        
        // Check remaining elements
        const remainingElements = cardGroups.slice(cardGroup.index).length - 1;

        // Last element in array
        if(remainingElements === 0){
            if(!translationValue){
                // Initial call for last element
                if(cardGroup.bottomCard.classList.contains('open')){
                    // Adjust container height
                    updateContainerHeight(cardContainer, bottomCardHeight);
                    return 0;
                }
                return 0;
            } 
            else{
                // Recursive call for last element
                updateContainerHeight(cardContainer, translationValue);
                
                // Update translations
                bottomCardTranslations[cardGroup.index] += translationValue;
                topCardTranslations[cardGroup.index] += translationValue;
                return depth;
            }
        }
        
        // Not the last element - check for collision with next card
        const nextCardTop = cardGroups[cardGroup.index + 1].getTopCardContainerPosition().top;
        
        // Check if elements will overlap
        if(newBottomCardBottom > nextCardTop){
            if(!translationValue){
                // Initial call - pass the height as translation value
                translationValue = bottomCardHeight;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            } 
            else{
                // Recursive call - update translations and continue
                bottomCardTranslations[cardGroup.index] += translationValue;
                topCardTranslations[cardGroup.index] += translationValue;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            }
        } 
        else{
            // No overlap
            if(!translationValue){
                // Initial call - pass height as translation value
                translationValue = bottomCardHeight;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            } 
            else{
                // Recursive call - update translations and continue
                bottomCardTranslations[cardGroup.index] += translationValue;
                topCardTranslations[cardGroup.index] += translationValue;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            }
        }
    }

    function collapseElements(cardGroup){
        const bottomCardHeight = cardGroup.bottomCard.getBoundingClientRect().height;
        const remainingElements = cardGroups.slice(cardGroup.index).length - 1;

        if(remainingElements === 0){
            // Last element - just update container height
            updateContainerHeight(cardContainer, -bottomCardHeight);
            return 0;
        } 
        else{
            // Not last element - update translations for all cards below
            let depth = 0;
            for (let i = 1; i <= remainingElements; i++){
                let index = cardGroup.index + i;
                bottomCardTranslations[index] -= bottomCardHeight;
                topCardTranslations[index] -= bottomCardHeight;
                depth++;
                
                if(i === remainingElements){
                    // Update container height after all translations are set
                    updateContainerHeight(cardContainer, -bottomCardHeight);
                }
            }
            return depth;
        }
    }

    // Update container height smoothly
    function updateContainerHeight(container, heightChange){
        const currentHeight = container.getBoundingClientRect().height;
        container.style.height = `${currentHeight}px`;
        container.style.transition = containerTransition;
        
        requestAnimationFrame(() => {
            container.style.height = `${currentHeight + heightChange}px`;
        });
    }

    function getMarginBottoms(cardGroups){
        for(let i = 0; i < cardGroups.length-1; i++){
            let marginBottom = Math.round(cardGroups[i+1].getTopCardContainerPosition().top - cardGroups[i].getBottomCardContainerPosition().bottom);
            console.log("marginBottom", marginBottom);
        }
    }

    // Handle dynamic clip-path animation
    function animateClipPath(cardGroup, isOpening){
        const bottomCard = cardGroup.bottomCard;
        const topCard = cardGroup.topCard;
        
        // Get dimensions
        const bottomCardHeight = bottomCard.getBoundingClientRect().height;
        const topCardHeight = topCard.getBoundingClientRect().height;
        
        // Calculate proper clip amount - the part that extends above the top card
        const clipAmount = Math.max(0, bottomCardHeight - topCardHeight);
        
        if(isOpening){
            // For opening animation: start with clip, then animate to fully visible
            // Start with calculated clip amount
            bottomCard.style.clipPath = `inset(${clipAmount}px 0 0 0)`;
            
            // Animate to fully visible after a short delay for smoother transition
            requestAnimationFrame(() => {
                bottomCard.style.clipPath = 'inset(0 0 0 0)';
            });
        } 
        else{
            // For closing animation: start visible, then animate to clipped
            bottomCard.style.clipPath = 'inset(0 0 0 0)';
            
            // Animate to clipped state
            requestAnimationFrame(() => {
                bottomCard.style.clipPath = `inset(${clipAmount}px 0 0 0)`;
            });
        }
    }
});