// jshint esversion:8

function setup() {
Vue.config.ignoredElements = [
  'a-scene',
  'a-asset-item',
  'a-image',
  'a-curvedimage',
  'a-assets',
  'a-text',
  'a-plane',
  'a-cylinder',
  'a-rounded',
  'a-light',
  'a-entity',
  'a-camera',
  'a-box',
  'a-sky',
  'a-cursor',
  'a-gltf-model',
  'a-triangle',
  'a-cubemap'
]  
  
Vue.component('square-pt',{
  props: {
    isPan: {
      type: Boolean,
      required: true
    },
    brushMode: {
      type: String,
      required: true
    }
  },
  template:`     
<div class="builder-square-pt" :class="{entrance:state==='entrance', exit:state==='exit', wall:state==='wall', empty:state==='empty'}" @mousedown="emitPanMode(brushMode)" @touchstart="emitPanMode(brushMode)" @mousemove="setState(brushMode)">
</div>
`,
  data() {
    return{
      state: 'empty',
      id: [] //eg. [11,12]
    }
  },
  methods: {
    emitPanMode(x) {
      if (this.brushMode!=='') {this.confirmState(x)}
      this.$emit('on-pan');      
    },
    setState(x) {
      if (this.isPan&&this.brushMode!=='') {this.confirmState(x)}
    },
    forceState(x) {
      this.confirmState(x);     
    },
    confirmState(x) {
      if (this.state==='empty') {
        if (x==='wall') {this.state=x; this.$emit('confirm-change', x, this.id);}
        else if (x==='entrance'||x==='exit') {this.$emit('confirm-move-old', x, this.id);}                
      } else if (this.state==='wall') {
        if (x==='empty') {this.state=x; this.$emit('confirm-change', x, this.id);}       
      }
    }
  }
})        
  
  
Vue.component('builder',{
  props: {
  },
  template:`     
<div ref="builderContainer" class="builder-container" style="justify-content: space-evenly" @mouseleave="togglePan(false)" @mouseup="togglePan(false)">
  <div ref="builder" :class="['builder-screen', {isAnimating:isAnimating, isAnimatingFast:isAnimatingFast}]" :style="{transform: transformString}">
    <div :class="['builder-tab', {isAnimating:isAnimating, isAnimatingFast:isAnimatingFast}]" :style="{transform: transformStringTab}">
      <button ref="tabBtn1" class="builder-block-btn" style="left:19px; top:2px; background:#19191c; box-shadow:none;"><img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/compass-dark.svg?v=1660398102803" style="margin-top:1px"/></button>
      <button ref="tabBtn2" class="builder-block-btn" style="right:19px; top:2px; background:#19191c; box-shadow:none;"><img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/disc-dark.svg?v=1660398103963"/></button>
    </div>
    <div class="builder-block-container">
      <div ref="cubeBtn" class="builder-blockA" style="margin-top: 30px;"></div>
      <div class="builder-blockA">
        <div v-show="isHelpscreenOpen" class="helpscreen" style="margin-left: -33px">
          <div class="helpscreen-splitL">
            <div class="helpscreen-splitVertical">
              <div class="helpscreen-splitVertical" style="height: 50%">
                <img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/settings.svg?v=1660398104710" class="credits-icon" style="height:25px; width:25px"/>
              </div>
              <div class="helpscreen-splitVertical" style="height: 25%">
                <img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/cross.svg?v=1660398103105" class="credits-icon" style="height:25px; width:25px; transform: rotate(45deg)"/>
              </div>
              <div class="helpscreen-splitVertical" style="height: 25%">
                <img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/maximize.svg?v=1660398103507" class="credits-icon" style="height:25px; width:25px"/>
              </div>
            </div>
            <div ref="optionBtn10" class="helpscreen-splitVertical" style="height: 20%">
              <img class="credits-icon" src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/duck.jpg?v=1660398102711"/>
              <div class="credits-icon-shadow"></div>
            </div>
          </div>
          <div class="helpscreen-splitR" style="width: 70%">
            <div class="helpscreen-splitVertical">
              <div class="helpscreen-splitVertical" style="height: 50%">
                <div :class="['selector-box-heuristic', {e:heuristic==='e', m:heuristic==='m', n:heuristic==='n' }]" style=""></div>
                <div class="container">
                  <div class="helpscreen-splitVertical" style="height: 50%">
                    <div ref="optionBtn1" class="helpscreen-splitL" style="width: 50%">Euclidean</div>
                    <div ref="optionBtn2" class="helpscreen-splitR" style="width: 50%">Manhattan</div>
                  </div>
                  <div class="helpscreen-splitVertical" style="height: 50%">
                    <div ref="optionBtn3" class="helpscreen-splitL" style="width: 50%">Scaled<br>Euclidean²</div>
                    <div ref="optionBtn4" class="helpscreen-splitR" style="width: 50%">No Heuristic</div>
                  </div>
                </div>
              </div>
              <div class="helpscreen-splitVertical" style="height: 25%">
                <div :class="['selector-box-diagonal', {active:diagonal}]"></div>
                <div class="container">
                  <div ref="optionBtn5" class="helpscreen-splitL" style="width: 50%">Diagonal</div>
                  <div ref="optionBtn6" class="helpscreen-splitR" style="width: 50%">No Diagonal</div>
                </div>
              </div>
              <div class="helpscreen-splitVertical" style="height: 25%">
                <div class="selector-box-screen" style="width:40px; margin-left:-200px;"></div>
                <div class="selector-box-screen"></div>
                <div class="selector-box-screen" style="width:40px; margin-left:200px;"></div>
                <div class="container">
                  <div ref="optionBtn7" class="helpscreen-splitL" style="width: 25%">
                    <img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/chevron-left.svg?v=1660398102711" class="credits-icon" style="height:25px; width:25px"/>
                  </div>
                  <div ref="optionBtn8" class="helpscreen-splitR" style="width: 50%">Fullscreen/Window</div>
                  <div ref="optionBtn9" class="helpscreen-splitR" style="width: 25%">
                    <img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/chevron-right.svg?v=1660398102711" class="credits-icon" style="height:25px; width:25px"/>
                  </div>
                </div>
              </div>
            </div>
            <div class="helpscreen-splitVertical" style="height:20%; font-size:12px;">
              <div class="helpscreen-splitVertical" style="height: 50%">Joseph Zhu</div>
              <div class="helpscreen-splitVertical" style="height: 0%"><div class="divider-credits"></div></div>
              <div class="helpscreen-splitVertical" style="height: 50%">haozu.jz@gmail.com</div>
            </div>
          </div>
        </div>
        <button v-show="!isHelpscreenOpen" ref="squareBtn1" :class="['builder-square-btn', {active:brushMode==='entrance'}]" style="left: 19px;"><div class="icon icon-entrance"></div></button>
        <button v-show="!isHelpscreenOpen" ref="squareBtn2" :class="['builder-square-btn', {active:brushMode==='exit'}]" style="left: 109px"><div class="icon icon-exit"></div></button>
        <button v-show="!isHelpscreenOpen" ref="squareBtn3" :class="['builder-square-btn', {active:brushMode==='wall'}]" style="right: 109px"><div class="icon icon-wall"></div></button>
        <button v-show="!isHelpscreenOpen" ref="squareBtn4" :class="['builder-square-btn', {active:brushMode==='empty'}]" style="right: 19px"><div class="icon icon-empty"></div></button>
        <button v-show="!isHelpscreenOpen" ref="sideBtn1" :class="['builder-block-btn', {active:isBuildingMaze}]" style="border-radius: 0px 15px 15px 0px; width:32px; height:60px; left:0px; bottom:80px"><img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/box.svg?v=1660398102711" style="margin-top:3px;margin-left:-3px"/></button>
        <button ref="sideBtn2" :class="['builder-block-btn', {active:isHelpscreenOpen}]" style="border-radius: 15px 0px 0px 15px; width:32px; height:60px; right:0px; bottom:80px"><img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/message-circle.svg?v=1660398104223" style="margin-top:3px;margin-left:-1px"/></button>
      </div>
      <div class="builder-blockB">
        <button ref="blockBtn1" :class="['builder-block-btn', {active:pathSlow}]" style="left: 19px"><img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/compass.svg?v=1660398103226" style="margin-top:3px"/></button>
        <button ref="blockBtn2" :class="['builder-block-btn', {active:pathHide}]" style="left: 109px"><img src="https://cdn.glitch.global/f69eabef-cafb-49ca-8abe-21d01b857a68/disc.svg?v=1660398103734" style="margin-top:2px"/></button>
        <button ref="blockBtn3" class="builder-block-btn" style="right: 109px"><div class="icon icon-wall"></div><div class="icon icon-wall-left"></div><div class="icon icon-wall-right"></div></button>
        <button ref="blockBtn4" class="builder-block-btn" style="right: 19px"><div class="icon icon-empty"></div><div class="icon icon-empty-left"></div><div class="icon icon-empty-right"></div></button>
      </div>
    </div>
  </div>
  <div :class="['builder-screen-copy', {isAnimating:isAnimating, isAnimatingFast:isAnimatingFast}]" :style="{transform: transformString}">
    <div :class="['builder-tab-copy', {isAnimating:isAnimating, isAnimatingFast:isAnimatingFast}]" :style="{transform: transformStringTab}">
    </div>  
    <div class="builder-block-container-copy">
      <div class="builder-blockA-copy" style="margin-top: 30px;">
        <div ref="cubeContainer" class="builder-cube-container">
          <div class="builder-cube-layer" v-for="i in 13" :key="i"><div v-for="i in 169" :key="i" class="builder-cube-pt"></div></div>
        </div>
        <input ref="slideri" :class="['slider slider-a', {active:planeMode==='i'}]" type="range" min="0" max="12" value="6" @mousedown="togglePlane('i')" @touchstart="togglePlane('i')" @input="togglePlane('i', $event.target.value)">
        <input ref="sliderj" :class="['slider slider-b', {active:planeMode==='j'}]" type="range" min="0" max="12" value="6" @mousedown="togglePlane('j')" @touchstart="togglePlane('j')" @input="togglePlane('j', $event.target.value)">
        <input ref="sliderk" :class="['slider slider-c', {active:planeMode==='k'}]" type="range" min="0" max="12" value="6" @mousedown="togglePlane('k')" @touchstart="togglePlane('k')" @input="togglePlane('k', $event.target.value)">
      </div>
      <div class="builder-blockA-copy">
        <div v-show="!isHelpscreenOpen" ref="sqContainer" class="builder-square" @touchmove="move" @touchend="togglePan(false)" @mousedown="togglePan(true)" @touchstart="togglePan(true)">
          <square-pt v-for="i in 169" :key="i" :ref="'sq'+i" :is-pan="isPan" :brush-mode="brushMode" @on-pan="togglePan(true)" @confirm-change="confirmChange" @confirm-move-old="confirmMoveOld" class="sq"></square-pt>
        </div>
      </div>
      <div class="builder-blockB-copy">
      </div>
    </div>
  </div>
</div>
`,
  data() {
    return{
      isMaximized: false,
      isAnimating: false,
      isAnimatingFast: false,
      pulledDy: null,
      timeoutfunc: false,
      isPulledRecently: false,
      interactPosition: {
        x: 0,
        y: 0
      },
      isPan: false,
      brushMode: 'wall',
      planeMode: '',  //eg. 'i' 
      plane: '',  //eg. '6' 
      cube: {},
      square: {},
      nodes: [],
      astar: null,
      gridToCubeColorDict: {
        0:'rgba(107, 205, 107, 0.5)',
        1:'rgba(255, 133, 117, 0.5)',
        2:'rgba(230, 134, 0, 0.2)',
        3:'rgba(128, 128, 128, 0.1)'        
      },
      gridToColorDict: {
        0:'rgb(84, 185, 84)',
        1:'rgb(250, 113, 97)',
        2:'rgb(207, 130, 23)',
        3:'rgb(133, 134, 140)'        
      },      
      gridToStateDict: {
        0:'entrance',
        1:'exit',
        2:'wall',
        3:'empty'        
      },      
      stateToGridDict: {
        'entrance':0,
        'exit':1,
        'wall':2,
        'empty':3        
      },
      entrance: false,
      exit: false,
      pathSlow: true,
      pathHide: false,
      isHelpscreenOpen: false,
      heuristic: 'e2',
      diagonal: false,
      isBuildingMaze: false,
      updateMethod: 'update-scene-special'
    }
  },
  methods: {
    interactSetPosition(coordinates) { 
      const {x=0, y=0} = coordinates;
      this.interactPosition = {x:0,y};
      
      clearTimeout(this.timeoutfunc);
      this.isPulledRecently = true;
      this.timeoutfunc = setTimeout(()=>{this.isPulledRecently = false}, 100);
    },
    endPosition() {           
      clearTimeout(this.timeoutfunc);
      this.timeoutfunc = false;  
      
      if (this.isPulledRecently && (this.pulledDy<-1 || this.pulledDy>1)) {
        this.isAnimatingFast = true;
        if (this.pulledDy<-1) {
          this.interactPosition = {x:0, y:-790};        
          this.isMaximized = true;          
        } else if (this.pulledDy>1) {
          this.interactPosition = {x:0, y:0};       
          this.isMaximized = false;           
        }
      } else {
        this.isAnimating = true;
        if (this.interactPosition.y < -380) {
          this.interactPosition = {x:0, y:-790};        
          this.isMaximized = true;           
        } else if (this.interactPosition.y >= -380) {
          this.interactPosition = {x:0, y:0};       
          this.isMaximized = false;           
        }         
      }
    },
    togglePan(bool) {
      this.isPan = bool;
    },
    move(e) {
      if (this.isBuildingMaze) {return;}
      
      const p = e.touches[0];
      const el = document.elementFromPoint(p.clientX, p.clientY);     
      
      let square;
      for (let i=1;i<170;i++) {  
        if (this.$refs['sq'+i][0].$el===el) {square=this.$refs['sq'+i][0];}
      } 
      
      if (square&&this.brushMode!=='') {
        square.setState(this.brushMode);
      }    
      //let cmp = this.$children.find(c => c.$el === el);  //$children will be removed in Vue3
      //if (cmp) {
      //  cmp.setState()
      //}
    },
    toggleBrushMode(x) {
      if (this.brushMode===x) {this.brushMode = '';}
      else {this.brushMode = x;}
    },
    async brushAll(x) {      
      if (this.astar.isBusy || this.astar.isPending) {return;}
      if (this.astar.isShowingPath) {
        await this.astar.clearData();
      }      
      this.entrance = false;
      this.exit = false;
      
      if (this.plane) {
        for (let i=1;i<170;i++) {         
          this.$refs['sq'+i][0].state = x;
        }         
      }
      
      let y = this.stateToGridDict[x];
      let color = this.gridToColorDict[y];
      let size = 13;
      
      for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {           
          for (let k=0; k<size; k++) {
            this.nodes[i][j][k].grid = y;          
            let id = i+'_'+j+'_'+k; 
            this.cube[id].style['background-color'] = this.gridToCubeColorDict[y];           
            this.$emit(this.updateMethod, color, id); //non-corresponding id but doesnt matter since looping through all
          }
        }
      }  
    },
    togglePlane(facing, x) {       
      if (this.planeMode==='k') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[this.plane+'_'+i+'_'+j].style['border-width'] = '0px';
          } 
        }
      } else if (this.planeMode==='i') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[i+'_'+j+'_'+this.plane].style['border-width'] = '0px';
          } 
        }                   
      } else if (this.planeMode==='j') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[i+'_'+this.plane+'_'+j].style['border-width'] = '0px';
          } 
        }                   
      }
      
      this.planeMode = facing;      
      if (x) {
        this.plane = x;       
      } else {      
        this.plane = this.$refs['slider'+facing].value;
      }    
      
      if (this.planeMode==='k') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[this.plane+'_'+i+'_'+j].style['border-width'] = '2px';
            this.square[j+'_'+(12-i)].state = this.gridToStateDict[this.nodes[this.plane][i][j].grid];         
          } 
        }
      } else if (this.planeMode==='i') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[i+'_'+j+'_'+this.plane].style['border-width'] = '2px';
            this.square[j+'_'+i].state = this.gridToStateDict[this.nodes[i][j][this.plane].grid];  
          } 
        }
      } else if (this.planeMode==='j') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[i+'_'+this.plane+'_'+j].style['border-width'] = '2px';
            this.square[j+'_'+i].state = this.gridToStateDict[this.nodes[i][this.plane][j].grid]; 
          } 
        }                   
      }
    },
    clearPlane() {
      if (this.planeMode==='k') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[this.plane+'_'+i+'_'+j].style['border-width'] = '0px';
          } 
        }
      } else if (this.planeMode==='i') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[i+'_'+j+'_'+this.plane].style['border-width'] = '0px';
          } 
        }                   
      } else if (this.planeMode==='j') {
        for (let i=0; i<13; i++) {
          for (let j=0; j<13; j++) {
            this.cube[i+'_'+this.plane+'_'+j].style['border-width'] = '0px';
          } 
        }                   
      }      
      this.planeMode = '';
      this.plane = ''; 
      for (let i=1;i<170;i++) {         
        this.$refs['sq'+i][0].state = 'empty';
      }       
    },
    async confirmChange(state, pos) {
      if (this.plane==='' || this.isBuildingMaze) {return;}
      
      if (this.astar.isShowingPath && !this.astar.isPending) {
        await this.astar.clearData();
      }
      await this.change(state, pos);
      this.findPath();
    },
    change(state, pos) {     
      let x = this.stateToGridDict[state];
      let cubeColor = this.gridToCubeColorDict[x];
      let color = this.gridToColorDict[x];
      
      if (this.planeMode==='k') {
        this.nodes[this.plane][pos[0]][pos[1]].grid = x
        this.cube[this.plane+'_'+pos[0]+'_'+pos[1]].style['background-color'] = cubeColor;
        this.$emit(this.updateMethod, color, (12-pos[1])+'_'+this.plane+'_'+(12-pos[0]));        
      } else if (this.planeMode==='i') {
        this.nodes[(12-pos[0])][pos[1]][this.plane].grid = x
        this.cube[(12-pos[0])+'_'+pos[1]+'_'+this.plane].style['background-color'] = cubeColor;
        this.$emit(this.updateMethod, color, (12-this.plane)+'_'+(12-pos[0])+'_'+(12-pos[1]));
      } else if (this.planeMode==='j') {
        this.nodes[(12-pos[0])][this.plane][pos[1]].grid = x;
        this.cube[(12-pos[0])+'_'+this.plane+'_'+pos[1]].style['background-color'] = cubeColor;
        this.$emit(this.updateMethod, color, (12-pos[1])+'_'+(12-pos[0])+'_'+(12-this.plane));
      } 
    },
    async confirmMoveOld(state, pos) {
      if (this.plane==='' || this.isBuildingMaze) {return;}
      
      if (this.astar.isShowingPath && !this.astar.isPending) {
        await this.astar.clearData();
      }            
      await this.moveOld(state,pos);
      this.findPath();                               
    },
    moveOld(state, pos) {     
      if (this.planeMode==='') {return;}
      
      //clear old entrance/exit
      for (let i=1;i<170;i++) {     
        if (this.$refs['sq'+i][0].state===state) {
          this.$refs['sq'+i][0].state = 'empty';
        }
      }                          
                                
      let cubeColor = this.gridToCubeColorDict[3];
      let color = this.gridToColorDict[3];
            
      if (state==='entrance') {   
        if (this.entrance) {
          this.nodes[this.entrance[0]][this.entrance[1]][this.entrance[2]].grid = 3;
          let id = this.entrance[0]+'_'+this.entrance[1]+'_'+this.entrance[2]; 
          this.cube[id].style['background-color'] = cubeColor;   
          let id_3d = (12-this.entrance[2])+'_'+this.entrance[0]+'_'+(12-this.entrance[1]);
          this.$emit(this.updateMethod, color, id_3d);          
        }
      
        //save new entrance
        if (this.planeMode==='k') {this.entrance = [Number(this.plane),Number(pos[0]),Number(pos[1])];}
        else if (this.planeMode==='i') {this.entrance = [Number(12-pos[0]),Number(pos[1]),Number(this.plane)];}
        else if (this.planeMode==='j') {this.entrance = [Number(12-pos[0]),Number(this.plane),Number(pos[1])];}         
      } else {
        if (this.exit) {
          this.nodes[this.exit[0]][this.exit[1]][this.exit[2]].grid = 3;
          let id = this.exit[0]+'_'+this.exit[1]+'_'+this.exit[2]; 
          this.cube[id].style['background-color'] = cubeColor; 
          let id_3d = (12-this.exit[2])+'_'+this.exit[0]+'_'+(12-this.exit[1]);
          this.$emit(this.updateMethod, color, id_3d);           
        }
               
        //save new exit
        if (this.planeMode==='k') {this.exit = [Number(this.plane),Number(pos[0]),Number(pos[1])];}
        else if (this.planeMode==='i') {this.exit = [Number(12-pos[0]),Number(pos[1]),Number(this.plane)];}
        else if (this.planeMode==='j') {this.exit = [Number(12-pos[0]),Number(this.plane),Number(pos[1])];} 
      }               
      
      //set new entrance/exit   
      this.square[pos[1]+'_'+(12-pos[0])].state = state;                          
      this.confirmChange(state, pos);
    },
    findPath() { 
      if (!this.pathHide && this.entrance && this.exit && !this.isBuildingMaze) {
        this.astar.beginSearch(this.entrance, this.exit);          
      }
    },
    togglePathSlow() {
      this.pathSlow = !this.pathSlow;
      this.findPath();     
    },
    async togglePathHide() {
      this.pathHide = !this.pathHide;
      if (this.pathHide && this.astar.isShowingPath && !this.astar.isPending) {
        await this.astar.clearData();
      } 
      this.findPath();
    },
    toggleHelpScreen() {
      this.isHelpscreenOpen = !this.isHelpscreenOpen;
    },
    toggleHeuristic(x) {
      this.heuristic = x;
      this.findPath(); 
      
      localStorage.heuristic = x;
    },
    toggleDiagonal(bool) {
      this.diagonal = bool;     
      this.findPath();
      
      if (this.diagonal) {localStorage.diagonal = 't';}
      else {localStorage.diagonal = 'f';}
    },
    toggleFullscreen() {
      this.$emit('toggle-fullscreen');
    },
    adjustScreenPosition(x) {
      if (x==='l') {
        if (this.$refs.builderContainer.style['justify-content']==='space-evenly') {
          this.$refs.builderContainer.style['justify-content'] = 'flex-start';
          localStorage.screenPosition = 'l';
        }
        else if (this.$refs.builderContainer.style['justify-content']==='flex-end') {
          this.$refs.builderContainer.style['justify-content'] = 'space-evenly';
          localStorage.screenPosition = 'm';
        }
      } else {
        if (this.$refs.builderContainer.style['justify-content']==='space-evenly') {
          this.$refs.builderContainer.style['justify-content'] = 'flex-end';
          localStorage.screenPosition = 'r';
        }
        else if (this.$refs.builderContainer.style['justify-content']==='flex-start') {
          this.$refs.builderContainer.style['justify-content'] = 'space-evenly';
          localStorage.screenPosition = 'm';
        }
      }
    },
    async buildMaze() {
      if (this.astar.isBusy || this.astar.isPending) {return;}
      this.isBuildingMaze = true;      
      this.$refs.slideri.style['pointer-events'] = 'none';
      this.$refs.sliderj.style['pointer-events'] = 'none';
      this.$refs.sliderk.style['pointer-events'] = 'none';
      this.$refs.blockBtn3.style['pointer-events'] = 'none';
            
      if (this.astar.isShowingPath && !this.astar.isPending) {
        await this.astar.clearData();
      }
      this.clearPlane();
      this.brushAll('wall');
      await this.astar.buildMaze();
      
      this.isBuildingMaze = false;
      this.$refs.slideri.style['pointer-events'] = 'auto';
      this.$refs.sliderj.style['pointer-events'] = 'auto';
      this.$refs.sliderk.style['pointer-events'] = 'auto';
      this.$refs.blockBtn3.style['pointer-events'] = 'auto';
    },
    async toggleSpecialMode() {    
      if (localStorage.updateMethod==='update-scene') {
        this.updateMethod = 'update-scene-special';
        localStorage.updateMethod = 'update-scene-special';
        this.$emit('toggle-special', true);
      }
      else {
        this.updateMethod = 'update-scene';
        localStorage.updateMethod = 'update-scene';
        this.$emit('toggle-special', false);
      }
      
      for (let i=0; i<13; i++) {
        for (let j=0; j<13; j++) {          
          for (let k=0; k<13; k++) {
            this.$emit(this.updateMethod, this.gridToColorDict[this.nodes[i][j][k].grid], (12-k)+'_'+i+'_'+(12-j));
          }
        }
      }                       
      if (this.pathHide && this.astar.isShowingPath && !this.astar.isPending) {
        await this.astar.clearData();
      } 
      this.findPath();
    }
  },
  computed: {
    transformString() {
      const {x,y} = this.interactPosition;
      return `translate3D(${x}px, ${y}px, 0)`;
    },
    transformStringTab() {
      const {x,y} = this.interactPosition;
      if (!this.isMaximized && y<0) {
        return `translate3D(${x}px, ${-y*1.5}px, 0)`;
      } else if (!this.isMaximized) {
        return `translate3D(${x}px, ${y}px, 0)`;
      } else if (this.isMaximized) {
        return `translate3D(${x}px, ${-y+790}px, 0)`;                 
      }
    },    
  },    
  mounted() {      
    const element = this.$refs.builder;
    interact(element).draggable({
      onstart: () => {
        this.isAnimating = false;
        this.isAnimatingFast = false;
      },
      onmove: event => {
        event.dy = event.dy*1.5       
        let x = this.interactPosition.x + event.dx;
        let y = this.interactPosition.y + event.dy; 

        if (y<-820) {y=-820;}        
        this.pulledDy = event.dy;
       
        this.interactSetPosition({x,y});
      },
      onend: () => {
        this.endPosition();
      },
      beforeDestroy() {
        interact(element).unset();
      }     
    })
        
    const element1 = this.$refs.squareBtn1;
    interact(element1)
    .on('tap', event => {
      this.toggleBrushMode('entrance');
    })
    
    const element2 = this.$refs.squareBtn2;
    interact(element2)
    .on('tap', event => {
      this.toggleBrushMode('exit');
    })
    
    const element3 = this.$refs.squareBtn3;
    interact(element3)
    .on('tap', event => {
      this.toggleBrushMode('wall');
    })
    
    const element4 = this.$refs.squareBtn4;
    interact(element4)
    .on('tap', event => {
      this.toggleBrushMode('empty');
    })
    
    const element5 = this.$refs.blockBtn1;
    interact(element5)
    .on('tap', event => {
      this.togglePathSlow();      
    })
    
    const element6 = this.$refs.blockBtn2;
    interact(element6)
    .on('tap', event => {
      this.togglePathHide();
    })
    
    const element7 = this.$refs.blockBtn3;
    interact(element7)
    .on('tap', event => {
      this.brushAll('wall');     
    })
    
    const element8 = this.$refs.blockBtn4;
    interact(element8)
    .on('tap', event => {
      this.brushAll('empty');      
    })   
    
    const elementC = this.$refs.cubeBtn;
    interact(elementC)
    .on('tap', event => {
      this.clearPlane();     
    })
        
    const elTab1 = this.$refs.tabBtn1;
    interact(elTab1)
    .on('tap', event => {
      this.togglePathSlow();      
    })
    
    const elTab2 = this.$refs.tabBtn2;
    interact(elTab2)
    .on('tap', event => {
      this.togglePathHide();
    })
    
    const elSide1 = this.$refs.sideBtn1;
    interact(elSide1)
    .on('tap', event => {
      this.buildMaze();            
    })
    
    const elSide2 = this.$refs.sideBtn2;
    interact(elSide2)
    .on('tap', event => {
      this.toggleHelpScreen();
    }) 
    
    const elOption1 = this.$refs.optionBtn1;
    interact(elOption1)
    .on('tap', event => {
      this.toggleHeuristic('e');            
    })
    
    const elOption2 = this.$refs.optionBtn2;
    interact(elOption2)
    .on('tap', event => {
      this.toggleHeuristic('m');      
    }) 
    
    const elOption3 = this.$refs.optionBtn3;
    interact(elOption3)
    .on('tap', event => {
      this.toggleHeuristic('e2');            
    })
    
    const elOption4 = this.$refs.optionBtn4;
    interact(elOption4)
    .on('tap', event => {
      this.toggleHeuristic('n');      
    })
    
    const elOption5 = this.$refs.optionBtn5;
    interact(elOption5)
    .on('tap', event => {
      this.toggleDiagonal(true);            
    })
    
    const elOption6 = this.$refs.optionBtn6;
    interact(elOption6)
    .on('tap', event => {
      this.toggleDiagonal(false);            
    }) 
    
    const elOption7 = this.$refs.optionBtn7;
    interact(elOption7)
    .on('tap', event => {
      this.adjustScreenPosition('l');
    })
    
    const elOption8 = this.$refs.optionBtn8;
    interact(elOption8)
    .on('tap', event => {
      this.toggleFullscreen();      
    })
    
    const elOption9 = this.$refs.optionBtn9;
    interact(elOption9)
    .on('tap', event => {
      this.adjustScreenPosition('r');      
    })
    
    const elOption10 = this.$refs.optionBtn10;
    interact(elOption10)
    .on('tap', event => {
      this.toggleSpecialMode();      
    })    
       
    let list = [];  //for cube pt references
    let sqList = [];  //for sq pt references
    
    //build nodes
    const size = 13;
    for (let i=0; i<size; i++) {
      this.nodes[i] = [];
      for (let j=0; j<size; j++) {
        this.nodes[i][j] = [];       
        let sqId = j+'_'+i;
        sqList.push(sqId)             
        for (let k=0; k<size; k++) {
          this.nodes[i][j][k] = new Node([i,j,k]);    //.grid initiated as 3, denoting 'empty' 
          let id = i+'_'+j+'_'+k; 
          list.push(id);
        }
      }
    } 

    //default entrance & exit
    this.nodes[3][6][9].grid = 0;
    this.nodes[9][6][3].grid = 1;
    
    this.entrance = [3,6,9];
    this.exit = [9,6,3];
    
    //initiate astar object
    this.astar = new Astar(this.nodes, this); 
    this.astar.labelMazeWallDirections();
    
    //cannot use $refs of dynamically loaded els, eg. 'sq+i'
    
    //build cube display
    const cubePts = this.$refs.cubeContainer.getElementsByClassName('builder-cube-pt');
    for (let i=0; i<cubePts.length; i++) {     
      this.cube[list[i]] = cubePts[i];        
    }     
    
    //sliderC=Z(0=bottom)/sliderB=Y(0=up)/sliderA=X(0=right)
    for (let i=0; i<size; i++) {
      for (let j=0; j<size; j++) {           
        for (let k=0; k<size; k++) {
          let id = i+'_'+j+'_'+k; 
          this.cube[i+'_'+j+'_'+k].style['background-color'] = this.gridToCubeColorDict[this.nodes[i][j][k].grid];         
        }
      }
    }     

    //build square input display
    let sqPts = [];
    
    for (let i=1;i<170;i++) {         
      sqPts.push(this.$refs['sq'+i][0]);
    }         
    for (let i=0; i<sqPts.length; i++) {     
      this.square[sqList[i]] = sqPts[i];
      let proto = sqList[i].split('_');
      let id = [];
      id[0] = String(12-proto[1]);
      id[1] = proto[0];
      this.square[sqList[i]].id = id;
    }
    
    if (localStorage.heuristic) {this.heuristic = localStorage.heuristic;}    
    if (localStorage.diagonal==='t') {this.diagonal = true;}
    if (localStorage.screenPosition==='l' || localStorage.screenPosition==='r') {
      this.adjustScreenPosition(localStorage.screenPosition);
    }
    if (localStorage.updateMethod) {this.updateMethod = localStorage.updateMethod;}
    
    this.findPath();
  }
})      
  
  
Vue.component('scene',{
  props: {
  },
  template:`
    <div class="screen-container">  
      <div class="scene-container">
        <a-scene ref="scene" vr-mode-ui="enabled:false;">
          <a-entity movement-controls="fly: true; speed: 0.05;" touch-controls="enabled: false">
            <a-entity ref="cam" camera position="0 1.6 0" rotation="0 0 0" look-controls="enabled: true"></a-entity>
          </a-entity>
          <a-light
            type="directional"
            color="#FFF"
            intensity="0.5"
            position="-1 1 2">
          </a-light>
          <a-light
            type="directional"
            color="#FFF"
            intensity="0.25"
            position="1 -1 -15">
          </a-light>
          <a-light
            type="ambient"
            color="#FFF">
          </a-light>
        </a-scene>
      </div>

      <div :class="['control-pad',{active:isActiveL}]" style="left:10vw">
        <div ref="controlStickL" class="control-stick" :style="{transform: transformStringL}"></div>
      </div>
      <div :class="['control-pad',{active:isActiveR}]" style="right:10vw">
        <div ref="controlStickR" class="control-stick" :style="{transform: transformStringR}"></div>
      </div>
      <button class="control-pad-toggle" style="left:3vw" @click="togglePad('l')">
        <div :class="['control-pad-toggle-knob',{active:isActiveL}]"></div>
      </button>
      <button class="control-pad-toggle" style="right:3vw" @click="togglePad('r')">
        <div :class="['control-pad-toggle-knob',{active:isActiveR}]"></div>
      </button>
      <button class="control-pad-toggle" style="left:3vw;bottom: calc(0vh + 12.5px);" @click="toggleBuilder">
        <div :class="['control-pad-toggle-knob',{active:isBuilderActive}]"></div>
      </button>
      <button class="control-pad-toggle" style="right:3vw;bottom: calc(0vh + 12.5px);" @click="toggleVRUI">
        <div :class="['control-pad-toggle-knob',{active:isVRUIActive}]"></div>
      </button>

    <builder v-show="isBuilderActive" @update-scene="updateScene" @toggle-fullscreen="toggleFullscreen2" @toggle-special="toggleSpecial" @update-scene-special="updateSceneSpecial"></builder>
  </div>
`,
  data() {
    return {
      grid: {},
      isBuilderActive: true,
      isVRUIActive: false,
      isActiveL: true,
      isActiveR: false,
      isDraggingL: false,
      isDraggingR: false,
      interactPositionL: {
        x: 0,
        y: 0
      },
      interactPositionLShow: {
        x: 0,
        y: 0
      },
      xR: 0,
      yR: 0,
      interactPositionR: {
        x: 0,
        y: 0
      },
      interactPositionRShow: {
        x: 0,
        y: 0
      }
    }  
  },
  methods: {
    toggleFullscreen2() {
      this.$emit('toggle-fullscreen2');
    },
    updateScene(color,id) {
      if (color==='rgb(207, 130, 23)') {
        this.grid[id].setAttribute('visible', false);
        return;
      }
      this.grid[id].setAttribute('visible', true);
      this.grid[id].setAttribute('color', color);
    },
    updateSceneSpecial(color,id) {
      if (color==='rgb(133, 134, 140)') {
        this.grid[id].setAttribute('visible', false);
        return;
      }      
      this.grid[id].setAttribute('visible', true);     
      if (color==='rgb(207, 130, 23)') {
        this.grid[id].setAttribute('opacity', 1);              
      } else if (color==='rgb(84, 185, 84)' || color==='rgb(250, 113, 97)') {
        this.grid[id].setAttribute('opacity', 0.7);      
      } else if (color==='rgb(107, 107, 250)') {
        this.grid[id].setAttribute('opacity', 0.7);          
      } else {
        this.grid[id].setAttribute('opacity', 0.25);          
      }
      this.grid[id].setAttribute('color', color);
    },    
    toggleSpecial(bool) {
      if (bool) {
        for (const id in this.grid) {
          this.grid[id].setAttribute('height', '0.48');
          this.grid[id].setAttribute('width', '0.48');
          this.grid[id].setAttribute('depth', '0.48');
        } 
      } else {
        for (const id in this.grid) {        
          this.grid[id].setAttribute('height', '0.3');
          this.grid[id].setAttribute('width', '0.3');
          this.grid[id].setAttribute('depth', '0.3');
          this.grid[id].setAttribute('opacity', 1);
          this.grid[id].setAttribute('visible', true);
        }
      }
    },
    toggleBuilder() {
      this.isBuilderActive = !this.isBuilderActive;
    },
    toggleVRUI() {
      this.isVRUIActive = !this.isVRUIActive;
      if (this.isVRUIActive) {this.$refs.scene.setAttribute('vr-mode-ui', 'enabled:true');}
      else {this.$refs.scene.setAttribute('vr-mode-ui', 'enabled:false');}
    },
    togglePad(side){
      if (side === 'l') {this.isActiveL = !this.isActiveL;} 
      else if (side === 'r') {
        this.isActiveR = !this.isActiveR;
        if (this.isActiveR) {
          const R = this.$refs.scene.camera.el.object3D.rotation;
          this.$refs.cam.setAttribute('look-controls', 'enabled: false');          
          this.yR = R.x;
          this.xR = R.y;
          this.$refs.scene.camera.el.object3D.rotation.set(this.yR,this.xR,0);
        }
        else {this.$refs.cam.setAttribute('look-controls', 'enabled: true');}
      }  
    },
    moveCamera() {        
      const _this = this;     
      const R = this.$refs.scene.camera.el.object3D.rotation;
      const P = this.$refs.scene.camera.el.object3D.position;    
      const vector = new THREE.Vector3();
      
      function move() {                             
        let V = _this.$refs.scene.camera.getWorldDirection(vector);
        V.multiplyScalar(-0.0008*_this.interactPositionLShow.y);
        P.add(V);
        P.x += 0.0008*cos(R.y)*_this.interactPositionLShow.x;
        P.z += -0.0008*sin(R.y)*_this.interactPositionLShow.x;
        _this.$refs.scene.camera.el.object3D.position.set(P.x,P.y,P.z);
      }      
      this.isDraggingL = setInterval(move, 5);                                                     
    },
    stopMoveCamera() {
      clearInterval(this.isDraggingL);
      this.isDraggingL = false;
    },
    rotateCamera() {        
      const _this = this;
      const piHalf = Math.PI/2;
      
      function rotate() {        
        _this.xR+=-0.0005*_this.interactPositionRShow.x;
        _this.yR+=-0.0005*_this.interactPositionRShow.y;
        if (_this.yR > piHalf) {_this.yR = piHalf;} 
        else if (_this.yR < -piHalf) {_this.yR = -piHalf;}              
        _this.$refs.scene.camera.el.object3D.rotation.set(_this.yR,_this.xR,0);
      }      
      this.isDraggingR = setInterval(rotate, 5);     
    },
    stopRotateCamera() {
      clearInterval(this.isDraggingR);
      this.isDraggingR = false;
    },
    interactSetPosition(coordinates, side) {    
      let {x=0, y=0} = coordinates;
      let rad = Math.atan2(y, x);
      
      if (side === 'l') {
        this.interactPositionL = {x,y};        
        if ((x**2 + y**2)>1600) { 
          x= Math.cos(rad) * 40;
          y= Math.sin(rad) * 40;           
        }      
        this.interactPositionLShow = {x,y};  
      } else if (side === 'r') {
        this.interactPositionR = {x,y};        
        if ((x**2 + y**2)>1600) { 
          x= Math.cos(rad) * 40;
          y= Math.sin(rad) * 40;            
        }      
        this.interactPositionRShow = {x,y};  
      }             
    }
  },
  computed: {
    transformStringL() {
      if (this.isDraggingL) {
        const {x,y} = this.interactPositionLShow;
        return `translate3D(${x}px, ${y}px, 0)`;
      }
    },
    transformStringR() {
      if (this.isDraggingR) {
        const {x,y} = this.interactPositionRShow;
        return `translate3D(${x}px, ${y}px, 0)`;
      }
    }    
  },
  mounted() {   
    const elementL = this.$refs.controlStickL;
    interact(elementL).draggable({
      onstart: () => {
        this.moveCamera();
      },
      onmove: event => {
        let x = this.interactPositionL.x + event.dx;
        let y = this.interactPositionL.y + event.dy;        
        this.interactSetPosition({x,y},'l');
      },
      onend: () => {
        this.stopMoveCamera();
        this.interactSetPosition({x:0, y:0},'l');
      },
      beforeDestroy() {
        interact(elementL).unset();
      }
    })

    const elementR = this.$refs.controlStickR;
    interact(elementR).draggable({
      onstart: () => {
        this.rotateCamera();
      },
      onmove: event => {
        let x = this.interactPositionR.x + event.dx;
        let y = this.interactPositionR.y + event.dy;        
        this.interactSetPosition({x,y}, 'r');
      },
      onend: () => {
        this.stopRotateCamera();
        this.interactSetPosition({x:0, y:0}, 'r');
      },
      beforeDestroy() {
        interact(elementR).unset();
      }
    }) 
    
    const scene = document.querySelector('a-scene');
    
    const size = 13
    for (let i=0; i<size; i++) {
      for (let j=0; j<size; j++) {
        for (let k=size-1; k>=0; k--) { 
          let id = i+'_'+j+'_'+k
          let pos = (i*0.5-3)+' '+(j*0.5-1.4)+' '+(k*-0.5-3)         
          let box = document.createElement('a-box');
          box.setAttribute('position', pos);
          box.setAttribute('visible', false);
          scene.appendChild(box);                    
          this.grid[id] = box
        }
      }
    }
    
    //check mode of visual output
    if (localStorage.updateMethod==='update-scene') {
      for (const id in this.grid) {
        this.grid[id].setAttribute('color', 'rgb(133, 134, 140)')
        this.grid[id].setAttribute('height', '0.3');
        this.grid[id].setAttribute('width', '0.3');
        this.grid[id].setAttribute('depth', '0.3');
        this.grid[id].setAttribute('visible', true);
      }              
    } else {
      for (const id in this.grid) {
        this.grid[id].setAttribute('height', '0.48');
        this.grid[id].setAttribute('width', '0.48');
        this.grid[id].setAttribute('depth', '0.48');
      } 
      this.grid['3_3_6'].setAttribute('opacity', 0.7);
      this.grid['9_9_6'].setAttribute('opacity', 0.7);
      this.grid['3_3_6'].setAttribute('visible', true);
      this.grid['9_9_6'].setAttribute('visible', true);
    } 
    
    //default entrance & exit
    this.grid['3_3_6'].setAttribute('color', 'rgb(84, 185, 84)');
    this.grid['9_9_6'].setAttribute('color', 'rgb(250, 113, 97)');
  }   
})    
  
let app = new Vue ({
  el: '#app',
  data: { 
  }, 
  methods: {
    toggleFullscreen() {
      let elem = document.documentElement;
      if (!document.fullscreenElement &&
      !document.webkitFullscreenElement && !document.msFullscreenElement && !document.mozFullScreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { //Safari
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { //IE11
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) { //Mozilla
          elem.mozRequestFullScreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { 
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { 
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        }
      }
      this.fullscreenTrigger = !this.fullscreenTrigger
      },
    toggleOverlay(alt) {
      if (alt) {
        this.overlayload = false;
      } else if (!this.isloadingmodel) {
        this.overlayhelp = !this.overlayhelp;
         this.overlayload = false;        
      }
    }
  }
})
  
}

