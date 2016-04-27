//set the width of a column by the minumum required length
function setByMaxWidth(className, forceWidth){
	var resultRows = document.getElementsByClassName(className);
	var max = 0;
	//find the longest string we need to accomidate for 
	if(forceWidth != undefined)
		max = forceWidth;
	else
		for(var c=0; c<resultRows.length; c++)
			max = Math.max(max, resultRows[c].offsetWidth);

		
	//set it to that max
	for(var c=0; c<resultRows.length; c++){
		resultRows[c].style.float = "left";
		resultRows[c].style.width = max + "px";
	}
	//set the input header to match
	var input = document.getElementsByName(className.split("-")[1])[0];
	input.style.float = "left";
	input.style.width = max + "px";
	return max;
}

//set all the column widths to their minimum required width
//squeeze or expand on the company feild
function setAllWidths(){
	var width = 0;
	width += setByMaxWidth("data-FIRST");
	width += setByMaxWidth("data-LAST");
	width += setByMaxWidth("data-CHAPTER");
	width += setByMaxWidth("data-INITIATED");
	width += setByMaxWidth("data-FATHER");
	width += setByMaxWidth("data-STATUS");
	width += setByMaxWidth("data-GRADUATED");
	width += setByMaxWidth("data-STATE");
	var comWidth = setByMaxWidth("data-COMPANY");

	var maxWidth = $(".result")[0].offsetWidth
	comWidth = maxWidth-width-30;
	var comRows = $(".data-COMPANY");
	for(var c=0; c<comRows.length; c++){
		comRows[c] = $(comRows[c]);
		comRows[c].css("width", comWidth + "px");
		comRows[c].addClass("truncated");
	}
	var input = document.getElementsByName("COMPANY")[0];
	input.style.width = comWidth + "px";
}

function setLoadMore(){
	$("#load-more").click(function(){
		$.ajax(
			{
				url: "/next?lastn="+$("#load-more").attr("data-last"),
				type: "get",
				dataType: "html",
				error: function(){
					$("#load-more").text("ERROR");
				}, 
				success: function( strData ){
					$("#load-more").remove();
					$("#result-area").append(strData)
					setAllWidths();
					setLoadMore();
				}
			}							
		);
	});
}
