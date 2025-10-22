        gsap.registerPlugin(TextPlugin);

        // Design window - User Research -> Testing -> User Research (loop)
        const designSkillWords = ["User Research", "Testing", "Prototyping"];
        let designIndex = 0;

        function animateDesignSkill() {
            const nextIndex = (designIndex + 1) % designSkillWords.length;
            const nextWord = designSkillWords[nextIndex];
            
            gsap.to("#design-skill", {
                duration: 0.5,
                text: "",
                ease: "none",
                onComplete: () => {
                    gsap.to("#design-skill", {
                        duration: 0.8,
                        text: nextWord,
                        ease: "none",
                        delay: 0.3,
                        onComplete: () => {
                            designIndex = nextIndex;
                            setTimeout(animateDesignSkill, 3000);
                        }
                    });
                }
            });
        }

        // Design window second skill
        const designSkill2Words = ["Visual Design", "Design Systems", "Accessibility"];
        let design2Index = 0;

        function animateDesignSkill2() {
            const nextIndex = (design2Index + 1) % designSkill2Words.length;
            const nextWord = designSkill2Words[nextIndex];
            
            gsap.to("#design-skill-2", {
                duration: 0.5,
                text: "",
                ease: "none",
                onComplete: () => {
                    gsap.to("#design-skill-2", {
                        duration: 0.8,
                        text: nextWord,
                        ease: "none",
                        delay: 0.3,
                        onComplete: () => {
                            design2Index = nextIndex;
                            setTimeout(animateDesignSkill2, 4000);
                        }
                    });
                }
            });
        }

        // Tools window - Figma -> Adobe XD -> Sketch (loop)
        const toolWords = ["Figma", "Adobe XD", "Sketch"];
        let toolIndex = 0;

        function animateToolName() {
            const nextIndex = (toolIndex + 1) % toolWords.length;
            const nextWord = toolWords[nextIndex];
            
            gsap.to("#tool-name", {
                duration: 0.4,
                text: "",
                ease: "none",
                onComplete: () => {
                    gsap.to("#tool-name", {
                        duration: 0.6,
                        text: nextWord,
                        ease: "none",
                        delay: 0.3,
                        onComplete: () => {
                            toolIndex = nextIndex;
                            setTimeout(animateToolName, 3500);
                        }
                    });
                }
            });
        }

        // Development window
        const devSkillWords = ["HTML & CSS", "JavaScript", "Responsive Design"];
        let devIndex = 0;

        function animateDevSkill() {
            const nextIndex = (devIndex + 1) % devSkillWords.length;
            const nextWord = devSkillWords[nextIndex];
            
            gsap.to("#dev-skill", {
                duration: 0.6,
                text: "",
                ease: "none",
                onComplete: () => {
                    gsap.to("#dev-skill", {
                        duration: 0.9,
                        text: nextWord,
                        ease: "none",
                        delay: 0.3,
                        onComplete: () => {
                            devIndex = nextIndex;
                            setTimeout(animateDevSkill, 3200);
                        }
                    });
                }
            });
        }

        // Development window second skill
        const devSkill2Words = ["React Basics", "Git & GitHub", "REST APIs"];
        let dev2Index = 0;

        function animateDevSkill2() {
            const nextIndex = (dev2Index + 1) % devSkill2Words.length;
            const nextWord = devSkill2Words[nextIndex];
            
            gsap.to("#dev-skill-2", {
                duration: 0.5,
                text: "",
                ease: "none",
                onComplete: () => {
                    gsap.to("#dev-skill-2", {
                        duration: 0.7,
                        text: nextWord,
                        ease: "none",
                        delay: 0.3,
                        onComplete: () => {
                            dev2Index = nextIndex;
                            setTimeout(animateDevSkill2, 4200);
                        }
                    });
                }
            });
        }

        // Start animations with staggered delays
        setTimeout(animateDesignSkill, 2000);
        setTimeout(animateDesignSkill2, 3500);
        setTimeout(animateToolName, 2500);
        setTimeout(animateDevSkill, 3000);
        setTimeout(animateDevSkill2, 4000);