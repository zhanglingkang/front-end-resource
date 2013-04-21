$(function(){
  
  var ctx,
      $inputCanvas,
      inputCanvas,
      $changColor,
      $changLineWidth,
      $saveInputBtn,
      $outputImg,
      $clearCanvasBtn,
      isDrawing = false;
  init();
  function init(){
    $inputCanvas = $("#inputCanvas");
    inputCanvas = $inputCanvas[0];
    ctx = inputCanvas.getContext("2d");
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = "5";
    $changColor = $("[data-color]");
    $changLineWidth = $("#lineWidth");
    $saveInputBtn = $("#saveInputBtn");
    $outputImg = $("#outputImg");
    $clearCanvasBtn = $("#clearCanvasBtn");
    registerEvent();
  };
  function registerEvent(){
    $inputCanvas.bind("mousedown",startDraw);
    $inputCanvas.bind("mouseup mouseout",stopDraw);
    $inputCanvas.bind("mousemove",draw);
    $changColor.click(function(){//改变颜色
      ctx.strokeStyle = $(this).attr("data-color");
    });
    $changLineWidth.change(function(){
      ctx.lineWidth = $changLineWidth.val();
    });
    $saveInputBtn.click(function(){
      var outputData = inputCanvas.toDataURL();
      $outputImg.attr("src",outputData);
    });
    $clearCanvasBtn.click(function(){
      ctx.clearRect(0,0,inputCanvas.width,inputCanvas.height);
    })
    
  };

  function startDraw(evt){
    isDrawing = true;
    ctx.beginPath();//创建新路径
    ctx.moveTo(evt.pageX - inputCanvas.offsetLeft,evt.pageY - inputCanvas.offsetTop);//鼠标在画布中的位置
  }
  function stopDraw(){
    isDrawing = false;
  }
  function draw(evt){
    if(isDrawing){
      ctx.lineTo(evt.pageX - inputCanvas.offsetLeft,evt.pageY - inputCanvas.offsetTop);
      ctx.stroke();//画
    }
  };

});