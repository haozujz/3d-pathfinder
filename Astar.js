// jshint esversion:8

class Node {
  constructor(position) {
    this.grid = 3;
    this.x = position[0];
    this.y = position[1];
    this.z = position[2];
    this.parent = null;
    
    this.g = 0;
    this.h = 0;
    this.f = 0;
    
    this.isVisited = false;
    this.isNotVisited = false;
    
    this.mazeWallDirection = null;
    this.rank = 0;
  }
  
  clear() {
    this.parent = null;
    
    this.g = 0;
    this.h = 0;
    this.f = 0; 
    
    this.isVisited = false;
    this.isNotVisited = false;
  }
}

class Astar {
  constructor(nodes, _this) {
    this.nodes = nodes;
    this._this = _this;
    
    this.start = null;
    this.end = null;
    this.end_pos = null;
    
    this.visited = new MinHeap(node=>{return node.f;})
    this.not_visited = new MinHeap(node=>{return node.f;})
    this.finalPath = [];                  
    this.moves = [[0,-1,0],[0,1,0],[1,0,0],[-1,0,0],[0,0,-1],[0,0,1],
                 [1,-1,0],[1,1,0],[-1,1,0],[-1,-1,0],[0,-1,-1],[1,0,-1],[0,1,-1],[-1,0,-1],[0,-1,1],[1,0,1],[0,1,1],[-1,0,1],
                 [1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,-1],[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]
    this.validMoves = null;
    this.distanceToCubeEdge = Math.sqrt(2);
    this.distanceToCubeCorner = Math.sqrt(3);
    
    this.isOutsideMaze = x => (x>12) || (x<0) ? true : false;  //assume perfect 13x13x13 cube
       
    this.isPending = false;
    this.isBusy = false;
    this.isShowingPath = false;
    this.interval = false;
    
    this.mazeWalls = [];
  }
  
  async beginSearch(start_pos, end_pos) {
    //check: 1) max one path request pending only, 2) path searching has stopped 
    if (this.isPending) {return;}
    else {this.isPending = true;}                                               
    while (this.isBusy) {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = false;
        this.isBusy = false;
      }
    }                   
                  
    //clear data                       
    await this.clearData();
    
    //update entrance, exit & whether diagonal is allowed    
    this.start = this.nodes[start_pos[0]][start_pos[1]][start_pos[2]];
    this.end = this.nodes[end_pos[0]][end_pos[1]][end_pos[2]];
    this.validMoves = this._this.diagonal ? 26 : 6;
                         
    //search
    this.isPending = false;
    this.search(this._this.pathSlow);
  }
  
  search(isSlow) {
    this.isBusy = true;
    this.isShowingPath = true;
    
    this.not_visited.insert(this.start);
    this.start.isNotVisited = true;
    
    let current = null;
    let _this=this;
    let intervalIsRunning = false;
    
    function interval() {
      //check that an earlier function is not already running via setInterval 
      intervalCheck1();
      
      //check if no path is found or clearData is called
      if (_this.not_visited.items.length<=0) {
        if (_this.interval) {
          clearInterval(_this.interval);
          _this.interval = false;
        }
        _this.isBusy = false;
        return;
      }
      
      //check if end is found
      if (_this.not_visited.items[0]===_this.end) {      
        _this.finalizePath(_this.not_visited.items[0].parent);
        if (_this.interval) {
          clearInterval(_this.interval);
          _this.interval = false;
        }
        _this.isBusy = false;
        return;
      }
      
      //advance pathfinding
      current = _this.not_visited.extractMin();
      current.isNotVisited = false;                   
      _this.visited.insert(current); 
      current.isVisited = true;      
      _this.addChildren(current);
      
      //check if beginSearch has been called, ie. new search pending
      if (_this.isPending) {
        if (_this.interval) {
          clearInterval(_this.interval);
          _this.interval = false;
        }        
        _this.isBusy = false;
        return;
      }
      
      //function is recursive unless loop repeats via setInterval instead         
      intervalCheck2();
    }
    
    //for fast mode
    let intervalCheck1 = ()=>{};  //() => void 0;
    let intervalCheck2 = ()=>{interval();};
    
    //for slow mode
    if (isSlow) {
      intervalCheck1 = () => {
        if (intervalIsRunning) {return;}
        else {intervalIsRunning = true;}
      }  
      intervalCheck2 = () => { 
        intervalIsRunning = false;        
      }      
    }    
      
    //slow mode: setInterval, fast mode: recursive 
    if (isSlow) {
      this.interval = setInterval(interval, 30);
      return;
    } else {
      interval();
    }                 
  }
            
  addChildren(parent) {
    let newPos;
    let child;
    let tentativeG;
           
    for (let i=0; i<this.validMoves; i++) {      
      newPos = [parent.x + this.moves[i][0], parent.y + this.moves[i][1], parent.z + this.moves[i][2]];
      if (this.isOutsideMaze(newPos[0]) || this.isOutsideMaze(newPos[1]) || this.isOutsideMaze(newPos[2])) {continue;} 
      if (this.nodes[newPos[0]][newPos[1]][newPos[2]].isVisited) {continue;}
      if (this.nodes[newPos[0]][newPos[1]][newPos[2]].grid===2) {continue;}
           
      if (i>-1 && i<6) {tentativeG = parent.g + 1.0;}
      else if (i>17 && i<26) {tentativeG = parent.g + this.distanceToCubeCorner;} //~1.73205
      else {tentativeG = parent.g + this.distanceToCubeEdge;} //~1.41421                         
                                
      child = this.nodes[newPos[0]][newPos[1]][newPos[2]];                    
      if (child.isNotVisited && child.g<=tentativeG) {continue;}
      
      child.g = tentativeG;
      child.h = this.calcH(child, this.end);
      child.f = child.g + child.h;                                        
      child.parent = parent;
                                                                                                      
      if (child.isNotVisited) {
        this.not_visited.rescore(child);
      } else {
        this.not_visited.insert(child);
        child.isNotVisited = true;        
      }
                                                         
      //show not_visited nodes as light blue unless child is exit
      if (child===this.end) {continue;}    
      this.showSearched(child);
    }   
  }
    
  calcH(node0, node1) {
    const dx = Math.abs(node0.x - node1.x);
    const dy = Math.abs(node0.y - node1.y);
    const dz = Math.abs(node0.z - node1.z);
    
    if (this._this.heuristic==='e2') {return (dx**2 + dy**2 + dz**2)/3;}
    else if (this._this.heuristic==='e') {return Math.sqrt(dx**2 + dy**2 + dz**2);}
    else if (this._this.heuristic==='m') {return dx + dy + dz;}
    else {return 0;}
  }
                                                                 
  showSearched(node) {
    this._this.cube[node.x+'_'+node.y+'_'+node.z].style['background-color'] = 'rgba(107, 195, 250, 0.2)'
    this._this.$emit(this._this.updateMethod, 'rgb(71, 172, 235)', (12-node.z)+'_'+node.x+'_'+(12-node.y))    
  }
  
  showPath(node) {
    this._this.cube[node.x+'_'+node.y+'_'+node.z].style['background-color'] = 'rgba(107, 107, 250, 0.5)'
    this._this.$emit(this._this.updateMethod, 'rgb(107, 107, 250)', (12-node.z)+'_'+node.x+'_'+(12-node.y))                  
  }                                                                  
                                                                    
  clearPath(node) {
    this._this.cube[(node.x)+'_'+node.y+'_'+node.z].style['background-color'] = 'rgba(128, 128, 128, 0.1)'
    this._this.$emit(this._this.updateMethod, 'rgb(133, 134, 140)', (12-node.z)+'_'+node.x+'_'+(12-node.y))
  }
                                
  finalizePath(current) {
    //check exit is not adjacent to entrance
    if (current!==null) {
      //note minHeap properties will be lost      
      while (current.parent!==null) {
        this.finalPath.push(current);      
        current = current.parent;
      }
      for (let i=this.finalPath.length-1; i>=0; i--) {
        this.showPath(this.finalPath[i]);              
      }
    }
    this.isBusy = false;       
  }
  
  clearData() {   
    for (let i=1; i<this.visited.items.length; i++) {
      this.visited.items[i].clear();
      this.clearPath(this.visited.items[i]);      
    }
    if (this.visited.items.length>0) {
      this.visited.items[0].clear();
      if (this.visited.items[0] !== this.start) {
        this.clearPath(this.visited.items[0]);
      }       
    }
    for (let i=1; i<this.not_visited.items.length; i++) {
      this.not_visited.items[i].clear(); 
      if (this.not_visited.items[i] !== this.end) {
        this.clearPath(this.not_visited.items[i]);
      }     
    }
    if (this.not_visited.items.length>0) {
      this.not_visited.items[0].clear();
      if (this.not_visited.items[0] !== this.start && this.not_visited.items[0] !== this.end) {
        this.clearPath(this.not_visited.items[0]);
      }       
    }
    this.visited.items.length = 0;    
    this.not_visited.items.length = 0;
    this.finalPath.length = 0;
    this.isShowingPath = false;
  }                                                                 
  
  labelMazeWallDirections() {
    for (let i=0; i<13; i++) {
      for (let j=0; j<13; j++) {               
        for (let k=0; k<13; k++) {
          if (i%2===0) {
            if (j%2===0) {
              if  (k%2===0) {//empty for legibility
              } else {
                this.nodes[i][j][k].mazeWallDirection = 'z'
              }              
            } else {
              if (k%2===0) {
                this.nodes[i][j][k].mazeWallDirection = 'y'
              }             
            }   
          } else {
            if (j%2===0 && k%2===0) {
              this.nodes[i][j][k].mazeWallDirection = 'x'
            }              
          }          
        }
      }
    }
    
  }                                                               
                                                                 
  async buildMaze() {
    for (let i=0; i<13; i++) {
      for (let j=0; j<13; j++) {               
        for (let k=0; k<13; k++) {
          if (i%2===0) {
            if (j%2===0) {
              if  (k%2===0) {
                this.removeWall(this.nodes[i][j][k])
                this.nodes[i][j][k].parent = this.nodes[i][j][k]
                this.nodes[i][j][k].rank = 0
              } else {
                this.mazeWalls.push(this.nodes[i][j][k])
              }              
            } else {
              if (k%2===0) {
                this.mazeWalls.push(this.nodes[i][j][k])
              }             
            }   
          } else {
            if (j%2===0 && k%2===0) {
              this.mazeWalls.push(this.nodes[i][j][k])
            }              
          }          
        }
      }
    }
    
    let current
    let orientation
    let node0
    let node1
    
    await this.shuffleArray(this.mazeWalls)
    
    //use disjointSet/union-find
    while (this.mazeWalls.length>1) { 
      current = this.mazeWalls.pop()
      if (current.mazeWallDirection==='z') {
        await this.union(this.nodes[current.x][current.y][current.z-1], this.nodes[current.x][current.y][current.z+1], current)
      } else if (current.mazeWallDirection==='y') {
        await this.union(this.nodes[current.x][current.y-1][current.z], this.nodes[current.x][current.y+1][current.z], current)        
      } else {
        await this.union(this.nodes[current.x-1][current.y][current.z], this.nodes[current.x+1][current.y][current.z], current)        
      }      
    }        
    this.mazeWalls.length = 0
    
    //clear disjointSet/union-find data
    for (let i=0; i<13; i++) {
      for (let j=0; j<13; j++) {               
        for (let k=0; k<13; k++) {
          if (i%2===0) {
            if (j%2===0) {
              if  (k%2===0) {
                this.nodes[i][j][k].parent = null
                this.nodes[i][j][k].rank = 0
              }             
            } 
          } 
        }
      }
    }
    
  }
                                                                         
  shuffleArray(array) {
    //Durstenfield shuffle, skips i=0
    for(let i = array.length-1; i>0; i--) {
      const j = Math.floor(Math.random() * i);
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
  }
                                                                 
  find(node) {
    if (node.parent===node) {
      return node;
    } else {
      const parent = this.find(node.parent);
      node.parent = parent;      
      return node.parent;
    }       
  }
  
  union(node0, node1, wall) {
    const root0 = this.find(node0);
    const root1 = this.find(node1);
       
    if (root0===root1) {return;}
    
    if (root0.rank>root1.rank) { 
      root1.parent = root0;
    } else if (root1.rank>root0.rank) {
      root0.parent = root1;
    } else {
      root1.parent = root0;
      root0.rank++;
    }    
    this.removeWall(wall)
  }
                                                                               
  removeWall(node) {  
    node.grid = 3
    this._this.cube[node.x+'_'+node.y+'_'+node.z].style['background-color'] = 'rgba(128, 128, 128, 0.1)'
    this._this.$emit(this._this.updateMethod, 'rgb(133, 134, 140)', (12-node.z)+'_'+node.x+'_'+(12-node.y))       
  }
}
 
//to do:
//node.weight
//use node.x/y/z instead of pos = [], but then more garbage to collect if call getPos to return an array?
                                                                                                                                   
//delay, timeout, must return promise if missed, other freezes
//while loop freezes but recursive func does not, since break is in function call?                                       
//passing object vs variables as args: https://stackoverflow.com/questions/42396902/performance-of-passing-object-as-argument-in-javascript

//array.length =0, reuses array: allocated memory, avoids garbaging old arrays       
//if (integar===2) slightly faster than if (bool) on benchmarks
                                                                  
//finding duplicates: https://flexiple.com/find-duplicates-javascript-array/
