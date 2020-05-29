// 常量
// 每次移动的距离，步长
var STEP = 20;
// 分割容器
// 18行，10列
var ROW_COUNT = 18,
  COL_COUNT = 10;
// 创建每个模型的数据源
var MODELS = [
  // 第一个模型数据源（L型）
  {
    0: {
      row: 2,
      col: 0
    },
    1: {
      row: 2,
      col: 1
    },
    2: {
      row: 2,
      col: 2
    },
    3: {
      row: 1,
      col: 2
    },
  },
  // 第二个模型数据源（凸型）
  {
    0: {
      row: 1,
      col: 1
    },
    1: {
      row: 0,
      col: 0
    },
    2: {
      row: 1,
      col: 0
    },
    3: {
      row: 2,
      col: 0
    },
  },
  // 第三个模型数据源（田型）
  {
    0: {
      row: 1,
      col: 1
    },
    1: {
      row: 2,
      col: 1
    },
    2: {
      row: 1,
      col: 2
    },
    3: {
      row: 2,
      col: 2
    },
  },
  // 第四个模型数据源（一型）
  {
    0: {
      row: 0,
      col: 0
    },
    1: {
      row: 0,
      col: 1
    },
    2: {
      row: 0,
      col: 2
    },
    3: {
      row: 0,
      col: 3
    },
  },
  // 第五个模型数据源（Z型）
  {
    0: {
      row: 1,
      col: 1
    },
    1: {
      row: 1,
      col: 2
    },
    2: {
      row: 2,
      col: 2
    },
    3: {
      row: 2,
      col: 3
    },
  },
]

// 变量
// 当前使用的模型
var currentModel = {}
// 标记16宫格的位置
var currentX = 0,
  currentY = 0;
// 记录所有块元素的位置
// K=行_列 : V=块元素
var fixedBlocks = {}
// 定时器
var mInterval = null;

// 入口方法
init();
function init() {
  createModel();
  onKeyDown();
}

// 根据模型的数据源来创建对应的块元素了
function createModel() {
  // 判断游戏是否已经结束了
  if(isGameOver()){
    gameOver();
    return null;
  }
  // 确定当前使用哪一个模型
  currentModel = MODELS[_.random(0, MODELS.length - 1)];
  // 重新初始化 16宫格的 位置
  currentX = 0;
  currentY = 0;
  // 生成对应数量的块元素
  for (var key in currentModel) {
    var divEle = document.createElement('div');
    divEle.className = 'activity_model';
    document.getElementById('container').appendChild(divEle);
  }
  // 定位块元素的位置
  locationBlocks();
  autoDown();
}

// 根据数据源定位块元素的位置
function locationBlocks() {
  // 判断一些块元素的越界行为
  checkBound();
  // 1. 拿到所有的块元素
  var eles = document.getElementsByClassName('activity_model');
  for (var i = 0; i < eles.length; i++) {
    // 单个块元素
    var actvityModelEle = eles[i];
    // 2. 找到每个块元素对应的数据（行、列）
    var blockModel = currentModel[i];
    // 3. 根据每个块元素对应的数据来指定块元素的位置
    // 每个块元素的位置由两个值确定：1、16宫格所在的位置。2、块元素在16宫格的位置
    actvityModelEle.style.top = (currentY + blockModel.row) * STEP + 'px';
    actvityModelEle.style.left = (currentX + blockModel.col) * STEP + 'px';
  }
}

// 监听用户的键盘事件
function onKeyDown() {
  document.onkeydown = function (event) {
    // console.log(event.keyCode);
    switch (event.keyCode) {
      case 37:
        console.log('左');
        move(-1, 0);
        break;
      case 38:
        console.log('上');
        // move(0, -1);
        rotate();
        break;
      case 39:
        console.log('右');
        move(1, 0);
        break;
      case 40:
        console.log('下');
        move(0, 1);
        break;
    }
  }
}

// 移动
function move(x, y) {
  // 控制块元素进行移动
  // var actvityModelEle = document.getElementsByClassName('activity_model')[0];
  // actvityModelEle.style.top = parseInt(actvityModelEle.style.top || 0) + y * STEP + 'px';
  // actvityModelEle.style.left = parseInt(actvityModelEle.style.left || 0) + x * STEP + 'px';

  if (isMeet(currentX + x, currentY + y, currentModel)) {
    // 底部的触碰发生在移动16宫格的时候，并且此次移动是因为 Y 轴的变化而引起的
    if (y !== 0) {
      // 模型之间底部发生触碰了
      fixedBottomModel();
    }
    return;
  }

  // 16宫格在动
  currentX += x;
  currentY += y;
  // 根据16宫格的位置来重新定位块元素
  locationBlocks();
}

// 旋转模型，根据第二个小方块为中心旋转
function rotate() {
  // 算法
  // 旋转后的行 = 旋转前的列
  // 旋转后的列 = 3 - 旋转前的行

  // 克隆以下 currentModel
  var cloneCurrentModel = _.cloneDeep(currentModel);

  // 遍历我们的 模型数据源
  for (var key in cloneCurrentModel) {
    // 块元素的数据源
    var blockModel = cloneCurrentModel[key];
    // 实现我们的算法
    var temp = blockModel.row;
    blockModel.row = blockModel.col;
    blockModel.col = 3 - temp;
  }
  // 如果旋转之后会发生触碰，那么就不需要进行旋转了
  if (isMeet(currentX, currentY, cloneCurrentModel)) {
    return;
  }
  // 接受了这次旋转
  currentModel = cloneCurrentModel;

  // 重新排列
  locationBlocks();
}

// 控制模型只能在容器中移动
function checkBound() {
  // 定义模型可以活动的边界
  var leftBound = 0,
    rightBound = COL_COUNT,
    bottomBound = ROW_COUNT;
  // 当块元素超出了边界之后，让 16宫格 后退一步
  for (var key in currentModel) {
    // 块元素的数据
    var blockModel = currentModel[key];
    // 左侧越界
    if ((blockModel.col + currentX) < leftBound) {
      currentX++;
    }
    // 右侧越界
    if ((blockModel.col + currentX) >= rightBound) {
      currentX--;
    }
    // 底部越界
    if ((blockModel.row + currentY) >= bottomBound) {
      currentY--;
      fixedBottomModel();
    }
  }
}

// 把模型固定在底部
function fixedBottomModel() {
  // 1. 改变模型（中块元素）的样式
  // 2. 让模型不可以在进行移动
  var activityModelEles = document.getElementsByClassName('activity_model');
  // 重点
  for (var i = activityModelEles.length - 1; i >= 0; i--) {
    // 拿到每个块元素
    var activityModelEle = activityModelEles[i];
    // 更改块元素的类名
    activityModelEle.className = 'fixed_model';
    // 把该块元素放入变量中
    var blockModel = currentModel[i];
    fixedBlocks[(currentY + blockModel.row) + '_' + (currentX + blockModel.col)] = activityModelEle;
  }

  // 判断是否要清理
  isRemoveLine();

  // 3. 创建新的模型
  createModel();
}

// 判断模型之间的触碰问题
// x, y 表示16宫格《将要》移动到的位置
// model 表示当前模型数据源《将要》完成的变化
function isMeet(x, y, model) {
  // 所谓模型之间的触碰，在一个固定的位置已经存在一个被固定的块元素时，那么活动中的模型不可以在占用该位置
  // 判断触碰，就是在判断活动中的模型《将要移动到的位置》是已经存在被固定的模型（块元素）了，
  // 如果存在返回 true 表示将要移动到的位置会发生触碰，否则返回 false
  for (var k in model) {
    var blockModel = model[k];
    // 该位置是否已经存在块元素？
    if (fixedBlocks[(y + blockModel.row) + '_' + (x + blockModel.col)]) {
      return true;
    }
  }
  return false;
}

// 判断一行是否被铺满
function isRemoveLine() {
  // 在一行中，每一列都存在块元素，那么该行就需要被清理了
  // 遍历所有行中的所有列
  // 遍历所有行
  for (var i = 0; i < ROW_COUNT; i++) {
    // 标记符，假设当前行已经被铺满了
    var flag = true;
    // 遍历当前行中的所有列
    for (var j = 0; j < COL_COUNT; j++) {
      // 如果当前行中有一列没有数据，那么就说明当前行没有被铺满
      if (!fixedBlocks[i + '_' + j]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      // 该行已经被铺满了
      removeLine(i)
    }
  }
}

// 清理被铺满的这一行
function removeLine(line) {
  // 1. 删除该行中所有的块元素
  // 2. 删除该行中所有块元素的数据源
  // 遍历该行中的所有列
  for (var i = 0; i < COL_COUNT; i++) {
    // 1. 删除该行中所有的块元素
    document.getElementById('container').removeChild(fixedBlocks[line + '_' + i]);
    // 2. 删除该行中所有块元素的数据源
    fixedBlocks[line + '_' + i] = null;
  }
  downLine(line);
}

// 让被清理行之上的块元素下落
function downLine(line) {
  // 1. 被清理行之上的所有块元素数据源所在的行数 + 1
  // 2. 让块元素在容器中的位置下落
  // 3. 清理掉之前的块元素

  // 遍历被清理行之上的所有行
  for (var i = line - 1; i >= 0; i--) {
    // 该行中的所有列
    for (var j = 0; j < COL_COUNT; j++) {
      if (!fixedBlocks[i + '_' + j]) continue;
      // 存在数据
      // 1. 被清理行之上的所有块元素数据源所在的行数 + 1
      fixedBlocks[(i + 1) + '_' + j] = fixedBlocks[i + '_' + j];
      // 2. 让块元素在容器中的位置下落
      fixedBlocks[(i + 1) + '_' + j].style.top = (i + 1) * STEP + 'px';
      // 3. 清理掉之前的块元素
      fixedBlocks[i + '_' + j] = null;
    }
  }
}

// 让模型自动下落
function autoDown() {
  if (mInterval) {
    clearInterval(mInterval);
  }
  mInterval = setInterval(function () {
    move(0, 1);
  }, 600)
}

// 判断游戏结束
function isGameOver() {
  // 当第0行存在块元素的时候，表示游戏结束了
  for (var i = 0; i < COL_COUNT; i++) {
    if (fixedBlocks['0_' + i]) {
      return true;
    }
  };
  return false;
}

// 结束掉游戏
function gameOver(){
  // 1. 停止定时器
  if(mInterval){
    clearInterval(mInterval);
  }
  // 2. 弹出对话框
  alert('大吉大利，今晚吃鸡！');
}