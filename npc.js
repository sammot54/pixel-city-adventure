class NPC {
    constructor(x, y, type, name, conversations) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type; // 'shopkeeper', 'guard', 'citizen', 'quest_giver'
        this.name = name;
        this.conversations = conversations;
        this.currentConversationId = 'greeting';
        this.questsGiven = [];
        this.color = this.getColorByType();
    }
    
    getColorByType() {
        switch(this.type) {
            case 'shopkeeper': return '#FFD700'; // Gold
            case 'guard': return '#8B4513'; // Brown
            case 'citizen': return '#87CEEB'; // Sky Blue
            case 'quest_giver': return '#DA70D6'; // Orchid
            default: return '#87CEEB';
        }
    }
    
    getConversation(conversationId = null) {
        const id = conversationId || this.currentConversationId;
        return this.conversations[id] || this.conversations['greeting'];
    }
    
    processResponse(responseId) {
        const currentConv = this.getConversation();
        const response = currentConv.responses.find(r => r.id === responseId);
        
        if (response && response.action) {
            this.executeAction(response.action);
        }
        
        if (response && response.nextConversation) {
            this.currentConversationId = response.nextConversation;
        }
    }
    
    executeAction(action) {
        switch(action.type) {
            case 'give_item':
                console.log(`Received ${action.item}`);
                break;
            case 'start_quest':
                this.questsGiven.push(action.questId);
                console.log(`Quest started: ${action.questId}`);
                break;
            case 'shop':
                console.log('Opening shop...');
                break;
            case 'heal':
                game.player.heal(action.amount || 50);
                console.log(`Healed for ${action.amount || 50} HP`);
                break;
        }
    }
    
    render(ctx) {
        // Draw NPC body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw type indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.x + 8, this.y + 8, 16, 16);
        
        // Draw simple face/symbol based on type
        ctx.fillStyle = '#FFFFFF';
        switch(this.type) {
            case 'shopkeeper':
                ctx.fillText('$', this.x + 12, this.y + 20);
                break;
            case 'guard':
                ctx.fillText('!', this.x + 14, this.y + 20);
                break;
            case 'citizen':
                ctx.fillText('?', this.x + 14, this.y + 20);
                break;
            case 'quest_giver':
                ctx.fillText('Q', this.x + 12, this.y + 20);
                break;
        }
    }
}

// Predefined NPC conversations
const NPCConversations = {
    shopkeeper: {
        greeting: {
            text: "Welcome to my shop! I have the finest goods in the city. What can I do for you?",
            responses: [
                {
                    id: 'browse',
                    text: "I'd like to browse your wares.",
                    action: { type: 'shop' },
                    nextConversation: 'shop'
                },
                {
                    id: 'leave',
                    text: "Just looking around, thanks.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        shop: {
            text: "Here are my finest items! Unfortunately, I'm still setting up my inventory system...",
            responses: [
                {
                    id: 'health_potion',
                    text: "Do you have any health potions?",
                    action: { type: 'give_item', item: 'Health Potion' },
                    nextConversation: 'thanks'
                },
                {
                    id: 'leave_shop',
                    text: "I'll come back later.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        thanks: {
            text: "Here you go! That's on the house for being my first customer!",
            responses: [
                {
                    id: 'thanks',
                    text: "Thank you so much!",
                    nextConversation: 'goodbye'
                }
            ]
        },
        goodbye: {
            text: "Come back anytime! Safe travels!",
            responses: [
                {
                    id: 'goodbye',
                    text: "Farewell!",
                    nextConversation: 'greeting'
                }
            ]
        }
    },
    
    guard: {
        greeting: {
            text: "Halt, citizen! I am a guard of this great city. State your business here.",
            responses: [
                {
                    id: 'exploring',
                    text: "Just exploring the city.",
                    nextConversation: 'exploring_response'
                },
                {
                    id: 'trouble',
                    text: "Is there any trouble around?",
                    nextConversation: 'trouble_response'
                },
                {
                    id: 'leave',
                    text: "Sorry to bother you.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        exploring_response: {
            text: "Very well. Be careful out there - wild animals have been spotted near the city outskirts.",
            responses: [
                {
                    id: 'animals',
                    text: "Tell me more about these animals.",
                    nextConversation: 'animals_info'
                },
                {
                    id: 'thanks',
                    text: "Thanks for the warning.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        trouble_response: {
            text: "Nothing major, but stay alert. There have been reports of aggressive wildlife lately.",
            responses: [
                {
                    id: 'help',
                    text: "Can you help me if I get in trouble?",
                    nextConversation: 'help_response'
                },
                {
                    id: 'understood',
                    text: "Understood, I'll be careful.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        animals_info: {
            text: "Wolves, bears, and wild boars have been more aggressive than usual. If you encounter one, fight bravely or flee quickly!",
            responses: [
                {
                    id: 'tips',
                    text: "Any fighting tips?",
                    nextConversation: 'fighting_tips'
                },
                {
                    id: 'thanks',
                    text: "I'll remember that.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        fighting_tips: {
            text: "Attack when you can, defend when you must, and don't be afraid to run if you're outmatched. Experience will make you stronger!",
            responses: [
                {
                    id: 'thanks',
                    text: "Thank you for the advice!",
                    nextConversation: 'goodbye'
                }
            ]
        },
        help_response: {
            text: "I'm stationed here, but I can give you this healing advice: rest and your wounds will mend.",
            responses: [
                {
                    id: 'heal',
                    text: "Could you help heal me now?",
                    action: { type: 'heal', amount: 30 },
                    nextConversation: 'healed'
                },
                {
                    id: 'thanks',
                    text: "Good to know, thanks.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        healed: {
            text: "There, that should help. Now go forth with renewed strength!",
            responses: [
                {
                    id: 'thanks',
                    text: "I feel much better, thank you!",
                    nextConversation: 'goodbye'
                }
            ]
        },
        goodbye: {
            text: "Stay safe out there, citizen. The city needs brave souls like you.",
            responses: [
                {
                    id: 'goodbye',
                    text: "I will. Farewell!",
                    nextConversation: 'greeting'
                }
            ]
        }
    },
    
    citizen: {
        greeting: {
            text: "Oh, hello there! I don't see many adventurers around these parts. Are you new to the city?",
            responses: [
                {
                    id: 'yes_new',
                    text: "Yes, I just arrived.",
                    nextConversation: 'new_visitor'
                },
                {
                    id: 'been_here',
                    text: "I've been here for a while.",
                    nextConversation: 'local_info'
                },
                {
                    id: 'just_passing',
                    text: "Just passing through.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        new_visitor: {
            text: "Welcome to our city! It's a wonderful place, though it can be dangerous outside the walls. The people here are friendly though!",
            responses: [
                {
                    id: 'tell_more',
                    text: "Tell me more about this place.",
                    nextConversation: 'city_info'
                },
                {
                    id: 'dangers',
                    text: "What kind of dangers?",
                    nextConversation: 'danger_info'
                },
                {
                    id: 'thanks',
                    text: "Thanks for the welcome!",
                    nextConversation: 'goodbye'
                }
            ]
        },
        local_info: {
            text: "Ah, a local! Have you noticed how restless the wildlife has been lately? My cat won't even go outside anymore.",
            responses: [
                {
                    id: 'wildlife',
                    text: "Yes, I've encountered some wild animals.",
                    nextConversation: 'wildlife_response'
                },
                {
                    id: 'cat',
                    text: "Smart cat!",
                    nextConversation: 'cat_response'
                }
            ]
        },
        city_info: {
            text: "We have shops, guards who keep us safe, and plenty of interesting people. Just watch out for the wild animals when you venture too far!",
            responses: [
                {
                    id: 'shops',
                    text: "Where are the shops?",
                    nextConversation: 'shop_directions'
                },
                {
                    id: 'thanks',
                    text: "Thanks for the information!",
                    nextConversation: 'goodbye'
                }
            ]
        },
        danger_info: {
            text: "Wild animals mostly - wolves, bears, that sort of thing. They've been more aggressive lately. The guards think something has them stirred up.",
            responses: [
                {
                    id: 'experienced',
                    text: "I can handle myself in a fight.",
                    nextConversation: 'brave_response'
                },
                {
                    id: 'worried',
                    text: "That does sound concerning.",
                    nextConversation: 'worried_response'
                }
            ]
        },
        wildlife_response: {
            text: "Oh my! I hope you weren't hurt. You adventurers are so brave. I could never face a wild animal.",
            responses: [
                {
                    id: 'not_so_bad',
                    text: "It's not as scary as it seems.",
                    nextConversation: 'encouraging'
                },
                {
                    id: 'thanks',
                    text: "Thanks for your concern.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        cat_response: {
            text: "Yes, Whiskers is very clever. Animals can sense danger better than we can sometimes.",
            responses: [
                {
                    id: 'agree',
                    text: "Animals do have good instincts.",
                    nextConversation: 'wisdom'
                },
                {
                    id: 'cat_name',
                    text: "Whiskers is a cute name!",
                    nextConversation: 'cat_story'
                }
            ]
        },
        shop_directions: {
            text: "There's a shopkeeper not too far from here - just look for the person in gold clothing. Very friendly and has good prices!",
            responses: [
                {
                    id: 'thanks',
                    text: "Perfect, thank you!",
                    nextConversation: 'goodbye'
                }
            ]
        },
        brave_response: {
            text: "How impressive! The city could use more brave souls like you. Just don't get too overconfident - even heroes need to be careful.",
            responses: [
                {
                    id: 'good_advice',
                    text: "That's good advice.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        worried_response: {
            text: "It is! I barely leave my house these days. But adventurers like you help keep us safe, so thank you for that.",
            responses: [
                {
                    id: 'my_pleasure',
                    text: "It's my pleasure to help.",
                    nextConversation: 'grateful'
                }
            ]
        },
        encouraging: {
            text: "Maybe someday I'll find the courage. For now, I'll leave the adventuring to experts like you!",
            responses: [
                {
                    id: 'believe',
                    text: "I believe you have it in you.",
                    nextConversation: 'inspired'
                },
                {
                    id: 'stay_safe',
                    text: "Nothing wrong with staying safe.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        wisdom: {
            text: "Exactly! We should listen to them more often. Whiskers has kept me out of trouble more times than I can count.",
            responses: [
                {
                    id: 'smart',
                    text: "Sounds like a very smart cat.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        cat_story: {
            text: "Thank you! I found him as a kitten in an alley. He's been my loyal companion ever since. Animals are such wonderful friends.",
            responses: [
                {
                    id: 'agree_animals',
                    text: "I agree, animals are great companions.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        grateful: {
            text: "People like you make our city a better place. Safe travels, brave adventurer!",
            responses: [
                {
                    id: 'thanks',
                    text: "Thank you for your kind words.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        inspired: {
            text: "You know what? Maybe I will! Thank you for believing in me. That means more than you know.",
            responses: [
                {
                    id: 'encourage',
                    text: "I'd be happy to see you out adventuring someday.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        goodbye: {
            text: "It was lovely talking with you! Take care, and may your adventures be exciting but safe!",
            responses: [
                {
                    id: 'goodbye',
                    text: "Farewell, and thanks for the chat!",
                    nextConversation: 'greeting'
                }
            ]
        }
    },
    
    quest_giver: {
        greeting: {
            text: "Greetings, adventurer! I have been waiting for someone like you. I have a task that requires a brave soul. Are you interested?",
            responses: [
                {
                    id: 'interested',
                    text: "I'm interested. What do you need?",
                    nextConversation: 'quest_details'
                },
                {
                    id: 'maybe_later',
                    text: "Maybe later. What kind of task?",
                    nextConversation: 'quest_preview'
                },
                {
                    id: 'not_interested',
                    text: "Not right now, thanks.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        quest_details: {
            text: "Excellent! The wild animals around our city have become unusually aggressive. I need you to defeat 5 wild animals to help restore balance. Will you accept this quest?",
            responses: [
                {
                    id: 'accept',
                    text: "I accept this quest!",
                    action: { type: 'start_quest', questId: 'animal_hunt' },
                    nextConversation: 'quest_accepted'
                },
                {
                    id: 'think_about_it',
                    text: "Let me think about it.",
                    nextConversation: 'quest_preview'
                }
            ]
        },
        quest_preview: {
            text: "The task involves dealing with the aggressive wildlife that's been troubling our city. It's dangerous work, but the reward is worth it.",
            responses: [
                {
                    id: 'what_reward',
                    text: "What's the reward?",
                    nextConversation: 'reward_info'
                },
                {
                    id: 'accept_now',
                    text: "I'll do it!",
                    action: { type: 'start_quest', questId: 'animal_hunt' },
                    nextConversation: 'quest_accepted'
                },
                {
                    id: 'leave',
                    text: "I'll consider it.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        reward_info: {
            text: "I can offer you 200 gold pieces and a special blessing that will permanently increase your strength. Quite generous for helping our community!",
            responses: [
                {
                    id: 'accept_reward',
                    text: "That's a good offer. I accept!",
                    action: { type: 'start_quest', questId: 'animal_hunt' },
                    nextConversation: 'quest_accepted'
                },
                {
                    id: 'still_thinking',
                    text: "I'm still thinking about it.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        quest_accepted: {
            text: "Wonderful! Go forth and face these wild creatures. Return to me when you have defeated 5 of them. May fortune favor you!",
            responses: [
                {
                    id: 'depart',
                    text: "I'll return with good news!",
                    nextConversation: 'quest_in_progress'
                }
            ]
        },
        quest_in_progress: {
            text: "How goes your quest, brave adventurer? Have you defeated 5 wild animals yet?",
            responses: [
                {
                    id: 'still_working',
                    text: "Still working on it.",
                    nextConversation: 'encouragement'
                },
                {
                    id: 'completed',
                    text: "Yes, I've defeated 5 animals!",
                    nextConversation: 'quest_complete'
                }
            ]
        },
        encouragement: {
            text: "Keep at it! I have faith in your abilities. The city is counting on you.",
            responses: [
                {
                    id: 'thanks',
                    text: "Thank you for the encouragement.",
                    nextConversation: 'quest_in_progress'
                }
            ]
        },
        quest_complete: {
            text: "Magnificent! You have done our city a great service. Here is your reward as promised. You are truly a hero!",
            responses: [
                {
                    id: 'thanks',
                    text: "Thank you! It was my pleasure to help.",
                    action: { type: 'give_item', item: '200 Gold' },
                    nextConversation: 'hero'
                }
            ]
        },
        hero: {
            text: "The people of this city will remember your deeds. You are always welcome here, champion!",
            responses: [
                {
                    id: 'honored',
                    text: "I'm honored to serve.",
                    nextConversation: 'goodbye'
                }
            ]
        },
        goodbye: {
            text: "Farewell for now. Should you change your mind about helping, you know where to find me.",
            responses: [
                {
                    id: 'goodbye',
                    text: "Until next time.",
                    nextConversation: 'greeting'
                }
            ]
        }
    }
};

// Factory function to create NPCs with predefined conversations
function createNPC(x, y, type, name) {
    const conversations = NPCConversations[type] || NPCConversations.citizen;
    return new NPC(x, y, type, name, conversations);
}