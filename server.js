const graphviz = require('graphviz');
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.text());

app.get('/', (req, res) => 
{
    res.render("index");
});

app.post('/generate-automaton', (req, res) => {
  const userInput = req.body;
  automaton.states = [];
  automaton.initial = [];
  automaton.accepting = [];
  automaton.alphabet = [];
  automaton.transition = {};
  parseUserInput(userInput);

  // Create a new graph
  var g = graphviz.digraph('G');

    for(state of automaton.states) {
        const node = g.addNode(state);
        node.set('shape', 'circle');

        if (automaton.accepting.includes(state)) {
        node.set('peripheries', '2');
        }
    }

    if(isDFAorNFA(automaton) === 'DFA'){
        for (const source in automaton.transition) {
        const destinations = new Map();

        for (const weight in automaton.transition[source]) {
            const destination = automaton.transition[source][weight].pop();

            if (destinations.has(destination)) {
            destinations.get(destination).push(weight);
            } else {
            destinations.set(destination, [weight]);
            }
        }

        for (const [destination, weights] of destinations) {
            const edge = g.addEdge(source, destination);
            edge.set('label', weights.join(','));
            }
        }
    }
    else if(isDFAorNFA(automaton) === 'NFA'){
        for (const source in automaton.transition) {
        const destinations = new Map();
        for (const symbol in automaton.transition[source]) {
            for (const destination of automaton.transition[source][symbol]) {
                if (destinations.has(destination)) {
                    destinations.get(destination).push(symbol);
                } 
                else {
                    destinations.set(destination, [symbol]);
                }
            }
        }

            for (const [destination, symbols] of destinations) {
                const edge = g.addEdge(source, destination);
                edge.set('label', symbols.join(','));
            }
        }  
    }

    // Add arrow to initial state
    const startArrow = g.addNode('');
    startArrow.set('shape', 'none');
    g.addEdge(startArrow, automaton.initial[0]).set('dir', 'forward').set('arrowhead', 'normal');

    g.output('svg', (data) => {
        res.set('Content-Type', 'image/svg+xml');
        res.send(data);
    });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// finite automaton object
var automaton = {
    states: [],
    initial: [],
    accepting: [],
    alphabet: [],
    transition: {}
};

// function to store user input
function parseUserInput(userInput){
    const lines = userInput.split('\n');
    let idx = 0;
    let iter = 0;
    // extract all states from input
    for (var j = 1; j < lines.length; j++) {
        if(lines[j] == '#initial'){
            iter = j;
            idx = 0;
            break;
        }
        automaton.states[idx] = lines[j];
        idx++;
    }
    // extract an initial state from input
    for (var j = iter + 1; j < lines.length; j++){
       if(lines[j] == '#accepting'){
            iter = j;
            idx = 0;
            break;
        }
        automaton.initial[idx] = lines[j];
        idx++;
    }
    // extract accepting states from input
   for (var j = iter + 1; j < lines.length; j++){
       if(lines[j] == '#alphabet'){
            iter = j;
            idx = 0;
            break;
        }
        automaton.accepting[idx] = lines[j];
        idx++;
    }
    // extract alphabets from input
    for (var j = iter + 1; j < lines.length; j++){
       if(lines[j] == '#transitions'){
            iter = j;
            idx = 0;
            break;
        }
        automaton.alphabet[idx] = lines[j];
        idx++;
    }
    // extract and create 2D array of transition funtions
    for(var j = iter + 1; j < lines.length; j++){
        const [source, actionSymbol] = lines[j].split(':');
        const [action, target] = actionSymbol.split('>');
        if (!automaton.transition[source]) {
            automaton.transition[source] = {};
        }
        automaton.transition[source][action] = target.split(",");
    }
}

// test if fa is nfa or dfa
function isDFAorNFA(automaton) {
  // Check if there is a state with multiple transitions for the same symbol
  for (const state in automaton.transition) {
    for (const symbol of automaton.alphabet) {
      const targets = automaton.transition[state][symbol];
      if (targets && targets.length > 1) {
        return 'NFA';
      }
    }
  }

  // Check if there is a state with a transition that doesn't read a symbol
  for (const state in automaton.transition) {
    if (automaton.transition[state][''] && automaton.transition[state][''].length > 0) {
      return 'NFA';
    }
  }

  return 'DFA';
}

