//创建一个对象，放图片元素和图片的路径
var imgObj = {
	//保存图片路径
	imgUrl : [],
	//保存预加载的图片
	imgElement :[]
};

(function(){
	//遍历，将全部图片预加载进来
	for(var i = 1; i< 80;i++){
		imgObj.imgUrl.push('daomuImg/'+i+'.jpg');
	}
	imgObj.imgUrl.push('daomuImg/home.png');
	imgObj.imgUrl.push('daomuImg/index.jpg');
	//console.log(imgObj.imgUrl);
	
})();

//图片预加载，显示加载进度
function preLoadImage(callback){
	var isNow = 0;
	for(var i = 0;i < imgObj.imgUrl.length;i++){
		(function(index){
			//创建一个img对象
			var img = new Image();
			//分别将每一个照片的路径赋值给img标签
			img.src = imgObj.imgUrl[index];
			//图片加载完毕后
			img.onload = function(){
				isNow++;
				//这里出现一个问题，加载按图片大小加载，所以不能保证顺序一定
				//进度条
				$("#percentage").html(Math.round(isNow*100/imgObj.imgUrl.length) +"%");
				imgObj.imgElement[imgObj.imgUrl[index]] = this;//j加载速度不一样，数组会错乱
				//当加载完毕后执行回调函数
				if(isNow == imgObj.imgUrl.length){
					callback();
				}
			}
		})(i);//函数自执行，将i值穿进去，接受形式参数
		
	}
}
//获取到画布
var firstCanvas = $("#firstCanvas");
var faceCanvas = $("#faceCanvas");
//创建绘画环境
var firstCanvasObj = firstCanvas.get(0).getContext('2d');
var faceCanvasObj = faceCanvas.get(0).getContext('2d');
//获取画布的设置宽高属性
firstCanvas.attr('width',$(document).width());
firstCanvas.attr('height',$(document).height());

faceCanvas.attr('width',$(document).width());
faceCanvas.attr('height',$(document).height());

var daomuCanvasWidth = $(document).width();
var daomuCanvasHeight = $(document).height();
//var faceCanvas = $("#faceCanvas");

var isTitleShow = false;

preLoadImage(function(){
	//过几面在跳转
	setTimeout(function(){
		$("#loading").hide();
	},300);
	//绘制第一张图
	firstCanvasObj.drawImage(imgObj.imgElement[imgObj.imgUrl[80]],0,0,daomuCanvasWidth,daomuCanvasHeight);
	faceCanvasObj.drawImage(imgObj.imgElement[imgObj.imgUrl[0]],0,0,daomuCanvasWidth,daomuCanvasHeight);
	//绑定擦拭函数
	bindSwipeEvent();
	
});

//判断图片擦拭的比例
function bindSwipeEvent(){
	//设置划线的属性
	firstCanvasObj.strokeStyle = "red";
	firstCanvasObj.lineWidth = 50;
	firstCanvasObj.lineCap = "round";
	//覆盖合成，相同的透明，其他的保留
	firstCanvasObj.globalCompositeOperation="destination-out";
	firstCanvas.on('touchstart',function(e){
		e = e.originalEvent.changedTouches[0];
		//console.log(e.pageX);
		firstCanvasObj.beginPath();
		firstCanvasObj.moveTo(e.pageX,e.pageY);
		firstCanvas.on('touchmove',function(e){
			e.preventDefault();
			e = e.originalEvent.changedTouches[0];
			firstCanvasObj.lineTo(e.pageX,e.pageY);
			firstCanvasObj.stroke();
		});
		firstCanvas.on('touchend',function(){
			firstCanvas.off('touchmove');
			firstCanvas.off('touchend');
			
			checkOperationPercent();
		});
	})
};
//判断擦除区域的面积占画布的百分比
function checkOperationPercent(){
	var allImageData = firstCanvasObj.getImageData(0,0,daomuCanvasWidth,daomuCanvasHeight).data;
	var operacityArr = [];
	for(var i=0;i<allImageData.length;i+=4){
		if(allImageData[i+3] == 0){
			//找到擦除的点(透明度为0的像素点)
			operacityArr.push(i);
		}
	}
	if(operacityArr.length >= daomuCanvasWidth*daomuCanvasHeight/2){
		firstCanvas.animate({opacity:0},1000,function(){
			$(this).remove();
			//loop face
			loopFace();
			//播放声音
			playAudio();
		});
	}
}
//露脸，脸部循环变动
function loopFace(){
	var iNow = 0;
	setInterval(function(){
		faceCanvasObj.clearRect(0,0,daomuCanvasWidth,daomuCanvasWidth);
		iNow++;
		faceCanvasObj.drawImage(imgObj.imgElement[imgObj.imgUrl[iNow]],0,0,daomuCanvasWidth,daomuCanvasHeight);
		//画图  带我回家吧
		if(isTitleShow){
		 	faceCanvasObj.drawImage(imgObj.imgElement[imgObj.imgUrl[79]],(daomuCanvasWidth-445)/2,100);
		}
		//循环脸动的效果
		if(iNow== 70){
			iNow = 15;
		}
	},50);
}
//音乐控制
function playAudio(){
	var faceSound = document.getElementById("faceSound");
	var gohomeSound = document.getElementById("gohomeSound");
	var bgSound = document.getElementById("bgSound");
	
	bgSound.play();  //背景音乐
	faceSound.play();
	
	faceSound.addEventListener('ended',function(){
		gohomeSound.play();
		isTitleShow = true;
	});
};
