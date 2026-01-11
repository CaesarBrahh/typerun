const wordContainer = document.getElementById('word-container');

class Word {
    constructor(z){
        this.el = document.createElement("SPAN");
        this.el.className = 'word';
        this.letters = [];
        let text = randomWords[Math.floor(Math.random()*randomWords.length)];
        
        for (var i = 0; i< text.length; i++) {
            const letterSpan = document.createElement('span');
            letterSpan.innerText = text[i];
            this.el.appendChild(letterSpan);
            this.letters.push(letterSpan);
        }

        wordContainer.append(this.el);
        
        this.el.style.zIndex = z;
        this.el.style.position = 'absolute';
        this.x = 0;
        this.el.style.top = Math.random() * (document.getElementById('word-container').clientHeight - 40) + 'px';

        this.update();
    }

    update() {
        if (!isRunning) return;

        this.el.style.left = this.x + 'px';

        this.check();
        this.x += 1;
        requestAnimationFrame(() => this.update());
    }

    check() {
        
    }

    remove() {
        this.el.remove();
    }
}