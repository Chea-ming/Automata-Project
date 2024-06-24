// Graph Implementation
class WeightedDirectedGraph {
  // create a new map object
  constructor() {
    this.adjacencyList = new Map();
  }

  // create a vertex consist of key and value
  addVertex(vertex) {
    this.adjacencyList.set(vertex, []);
  }

  // each edge has a source, weight and destination
  addEdge(source, destination, weight) {
    if (!this.adjacencyList.has(source)) {
      this.addVertex(source);
    }
    this.adjacencyList.get(source).push({ destination, weight });
  }
  // remove an edge from the list
  removeEdge(source, destination) {
    if (this.adjacencyList.has(source)) {
      const edges = this.adjacencyList.get(source);
      this.adjacencyList.set(
        source,
        edges.filter((edge) => edge.destination !== destination)
      );
    }
  }
  // remove a vertex from the list
  removeVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      return;
    }
    for (let adjacentVertex of this.adjacencyList.get(vertex)) {
      this.removeEdge(vertex, adjacentVertex.destination);
    }
    this.adjacencyList.delete(vertex);
  }
  // print out the entire graph
  printGraph() {
    for (let [vertex, edges] of this.adjacencyList) {
      let vertexString = `${vertex} -> `;
      for (let edge of edges) {
        vertexString += `(${edge.weight}, ${edge.destination}) `;
      }
      console.log(vertexString);
    }
  }
}

// DFA implementation
class DFA {
  constructor() {
    this.graph = new WeightedDirectedGraph();
  }

  addState() {
    for(let state of automaton.states){
      this.graph.addVertex(state);
    }  
  }

  addTransition() {
    for (const source in automaton.transition) {
      for (const weight in automaton.transition[source]) {
        const destination = automaton.transition[source][weight];
          this.graph.addEdge(source, destination, weight);
      }
    }
  }

  isAccepted(input) {
    let currentState = automaton.initial[0];
    for (let i = 0; i < input.length; i++) {
      const nextState = this.getNextState(currentState, input[i]);
      if (nextState === null) {
        return false;
      }
      currentState = nextState;
    }
    // Check if the final state is an accepting state
    return this.isFinalState(currentState);
  }

  getNextState(currentState, input) {
    const edges = this.graph.adjacencyList.get(currentState);
    var dest = null;
    edges.forEach((edge) => {
      if (edge.weight == input){
        dest = edge.destination[0];
        return edge.destination[0];
      }
    });
    return dest;
  }

  isFinalState(state) {
    for(let accepting of automaton.accepting){
      if(state === accepting) return true;
    } 
    return false;
  }
}

class NFA {
  constructor() {
    this.graph = new WeightedDirectedGraph();
  }

  addState() {
    for (let state of automaton.states) {
      this.graph.addVertex(state);
    }
  }

  addTransition() {
    for (const source in automaton.transition) {
      for (const weight in automaton.transition[source]) {
        const destinations = automaton.transition[source][weight];
        for (const destination of destinations) {
          this.graph.addEdge(source, destination, weight);
        }
      }
    }
  }

  isAccepted(input) {
    if (input.length === 0) {
      return automaton.initial.some((state) => this.isFinalState(state));
    }

    let currentStates = new Set(automaton.initial);
    const finalStates = new Set(automaton.accepting);

    for (let i = 0; i < input.length; i++) {
      const nextStates = new Set();
      for (let state of currentStates) {
        const destinations = this.getNextStates(state, input[i]);
        if (destinations.size === 0) {
          // If there are no next states, the input is not accepted
          return false;
        }
        for (let destination of destinations) {
          nextStates.add(destination);
        }
      }
      currentStates = nextStates;
    }

    return [...currentStates].some((state) => finalStates.has(state));
  }

  getNextStates(currentState, input) {
    const edges = this.graph.adjacencyList.get(currentState);
    const nextStates = new Set();

    // First, add the destinations for the edges that match the input character
    edges.forEach((edge) => {
      if (edge.weight === input) {
        nextStates.add(edge.destination);
      }
    });

    // Next, add the destinations for the epsilon transitions
    edges.forEach((edge) => {
      if (edge.weight === '$') {
        nextStates.add(edge.destination);
      }
    });

    return nextStates;
  }

  isFinalState(state) {
    // Check if the state is directly in the set of accepting states
    for (let accepting of this.automaton.accepting) {
      if (state === accepting) return true;
    }

    // Check if the state can reach an accepting state through epsilon transitions
    const queue = [state];
    const visited = new Set();

    while (queue.length > 0) {
      const currentState = queue.shift();
      visited.add(currentState);

      // Check if the current state is an accepting state
      for (let accepting of this.automaton.accepting) {
        if (currentState === accepting) return true;
      }

      // Add the destination states of the epsilon transitions to the queue
      const edges = this.graph.adjacencyList.get(currentState);
      edges.forEach((edge) => {
        if (edge.weight === '' && !visited.has(edge.destination)) {
          queue.push(edge.destination);
        }
      });
    }

    return false;
  }
}

// finite automaton object
var automaton = {
    states: [],
    initial: [],
    accepting: [],
    alphabet: [],
    transition: {}
};

// function to store user input
function createAutomaton(){
    automaton.states = [];
    automaton.initial = [];
    automaton.accepting = [];
    automaton.alphabet = [];
    automaton.transition = {};
    const textArea = document.getElementById('fas');
    const lines = textArea.value.split('\n');
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
    displayType();
    document.getElementById('str').value = '';

    const userInputTextarea = document.getElementById('fas');
    const userInput = userInputTextarea.value;

   fetch('/generate-automaton', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: userInput
  })
  .then(response => response.blob())
  .then(imageBlob => {
    // Create an image element and set the source to the image blob
    const imageElement = document.createElement('img');
    imageElement.src = URL.createObjectURL(imageBlob);

    // Clear any previous image and append the new one to the DOM
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';
    imageContainer.appendChild(imageElement);
  })
  .catch(error => console.error(error));
}

// display fa type
function displayType() {
  const parent = document.getElementById('type');
  const newParagraph = document.createElement('i');
  if(isDFAorNFA(automaton) == 'DFA') newParagraph.textContent = 'The input automaton is a Deterministic Finite Automaton (DFA).';
  else newParagraph.textContent = 'The input automaton is a Non-Deterministic Finite Automaton (NFA).';
  parent.replaceChild(newParagraph, parent.lastChild);
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
    if (automaton.transition[state]['$'] && automaton.transition[state]['$'].length > 0) {
      return 'NFA';
    }
  }

  return 'DFA';
}

function generateRandomDFA() {
  // Generate random number of states
  const numStates = Math.floor(Math.random() * (6 - 3 + 1)) + 3;
  const states = [];
  for (let i = 0; i < numStates; i++) {
    states.push(`s${i}`);
  }

  // Generate random initial state
  const initialState = states[Math.floor(Math.random() * numStates)];

  // Generate random accepting states
  const numAcceptingStates = Math.floor(Math.random() * (numStates / 2)) + 1;
  const acceptingStates = new Set();
  while (acceptingStates.size < numAcceptingStates) {
    acceptingStates.add(states[Math.floor(Math.random() * numStates)]);
  }

  // Generate random alphabet
  const alphabet = ["a", "b", "c"];

  // Generate random transitions
  const transitions = [];
  for (const state of states) {
    for (const symbol of alphabet) {
      const nextState = states[Math.floor(Math.random() * numStates)];
      transitions.push(`${state}:${symbol}>${nextState}`);
    }
  }

  // Construct the output string
  let output = "";
  output += "#states\n";
  output += states.join("\n");
  output += "\n#initial\n";
  output += initialState;
  output += "\n#accepting\n";
  output += [...acceptingStates].join("\n");
  output += "\n#alphabet\n";
  output += alphabet.join("\n");
  output += "\n#transitions\n";
  output += transitions.join("\n");

  document.getElementById('fas').value = output;
}

function generateRandomNFA() {
  // Generate random number of states
  const numStates = Math.floor(Math.random() * (6 - 3 + 1)) + 3;
  const states = [];
  for (let i = 0; i < numStates; i++) {
    states.push(`s${i}`);
  }

  // Generate random initial state
  const initialState = states[Math.floor(Math.random() * numStates)];

  // Generate random accepting states
  const numAcceptingStates = Math.floor(Math.random() * (numStates / 2)) + 1;
  const acceptingStates = new Set();
  while (acceptingStates.size < numAcceptingStates) {
    acceptingStates.add(states[Math.floor(Math.random() * numStates)]);
  }

  // Generate random alphabet
  const alphabet = ["a", "b", "c"];

  // Generate random transitions
  const transitions = [];
  for (const state of states) {
    for (const symbol of alphabet) {
      const numNextStates = Math.floor(Math.random() * 3) + 1;
      const nextStates = new Set();
      while (nextStates.size < numNextStates) {
        nextStates.add(states[Math.floor(Math.random() * numStates)]);
      }
      transitions.push(`${state}:${symbol}>${[...nextStates].join(",")}`);
    }
  }

  // Construct the output string
  let output = "";
  output += "#states\n";
  output += states.join("\n");
  output += "\n#initial\n";
  output += initialState;
  output += "\n#accepting\n";
  output += [...acceptingStates].join("\n");
  output += "\n#alphabet\n";
  output += alphabet.join("\n");
  output += "\n#transitions\n";
  output += transitions.join("\n");

  document.getElementById('fas').value = output;
}

// test to accept or reject string
function processString(){
  if(isDFAorNFA == 'DFA'){
    var tmp = new DFA();
  }
  else{
    var tmp = new NFA();
  }
  tmp.addState();
  tmp.addTransition();
  const input = document.getElementById('str').value;
  const accept = tmp.isAccepted(input);
  const parent = document.getElementById('process');
  const newParagraph = document.createElement('i');
  if(accept) newParagraph.textContent = 'The string is accpeted';
  else newParagraph.textContent = 'The string is rejected';
  parent.replaceChild(newParagraph, parent.lastChild);
}

function generateRandomString() {
  const randomLength = Math.floor(Math.random() * 15) + 1; // Random length between 1 and 15
  let randomString = '';

  if(automaton.alphabet.length == 0){
    document.getElementById('str').value = '';
  }
  else {
    for (let i = 0; i < randomLength; i++) {
      randomString += automaton.alphabet[Math.floor(Math.random() * automaton.alphabet.length)];
    }
    document.getElementById('str').value = randomString;
  }
  
}

const myTextarea = document.getElementById('fas');
const myButton = document.getElementById('createButton');

myTextarea.addEventListener('input', () => {
  // Enable the button if the textarea is not empty
  myButton.disabled = myTextarea.value.trim() === '';
});









































