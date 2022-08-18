class MinHeap {
  constructor(getValueFunc) {
    this.items = [];
    this.getValue = getValueFunc
  }
  
  insert(x) {
    this.items.push(x);
    this.bubbleUp();
  }
  
  extractMin() {
    this.swap(0, this.items.length-1);
    const min = this.items.pop();
    this.bubbleDown();
    return min;
  }
  
  extract(i=0) {
    let heapify = false;
    let iVal = this.getValue(i);
    let lastVal = this.getValue(this.items.length-1);
  
    this.swap(i, this.items.length-1);    
    const x = this.items.pop();
    
    if (lastVal>iVal) {
      this.bubbleDown(i);
    } else if (lastVal<iVal) {
      this.bubbleUp(i);
    }
    
    return x;
  }
  
  rescore(item) {
    const i = this.items.indexOf(item)
    this.bubbleDown(i);      
  }
  
  bubbleUp(i=this.items.length-1) {
    if (this.items.length<2) {return}
    const iVal = this.getValue(this.items[i]);
    
    while (i>0) {
      let parent = this.parent(i);
      
      if (iVal<this.getValue(this.items[parent])) {
        this.swap(i, parent);
        i = parent;
      } else {
        break;
      }     
    }
  }
  
  bubbleDown(i=0) {
    if (this.items.length<2) {return}
    const iVal = this.getValue(this.items[i]);
    
    while (i<this.items.length-1) {
      let child1 = this.leftChild(i);
      let child1Val;
      let child2 = this.rightChild(i);
      let child2Val;
      let swap = false;
      
      if (child1) {
        child1Val = this.getValue(this.items[child1])
        if (child1Val<iVal) {swap = child1;}       
      }
      
      if (child2) {
        child2Val = this.getValue(this.items[child2])
        if (child2Val<(swap===false ? iVal : child1Val)) {swap = child2;}         
      }      
      
      if (swap) {
        this.swap(i, swap);
        i = swap;
      } else {
        break;
      }     
    }                   
  }
  
  swap(iA, iB) {
    const tmp = this.items[iA];  
    this.items[iA] = this.items[iB];
    this.items[iB] = tmp;
  }
  
  leftChild(i) {
    i = i*2+1;
    if (i>=this.items.length) {i = false;}
    return i; 
  }
  
  rightChild(i) {
    i = i*2+2;
    if (i>=this.items.length) {i = false;}
    return i;
  }
  
  parent(i) {
    i = Math.floor((i-1)/2);
    if (i<0) {i = false;}
    return i; 
  }
}
