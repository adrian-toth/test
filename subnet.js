/*
http://jodies.de/ipcalc?host=192.168.0.1&mask1=24&mask2=
http://searchnetworking.techtarget.com/tip/How-to-subnet-Subnetting-calculations-and-shortcuts
*/

/* 
	################################
		Helper functions
	################################
*/   

function blank_element(domElement){
	domElement.value="";
}

function _dbg(msg){
	dbg = document.getElementById("debug");
	dbg.innerHTML = msg;
	dbg.innerHTML += "<br/>";
}


/* 
 * Handles forms' onChange() event.
 */
function trigger(){
	_in = document.getElementById("subnet");
	_ip = document.getElementById("ip_addr")
	_dbg("");
	
	var subn = new IPv4SubnetUtils();
	subn.initialize(_in.value);
		
	if (subn.is_valid_format() && IPv4SubnetUtils.is_valid_address(_ip.value)){
		
		/*
		var bin_str = subn.get_binary_addr(false);
		console.log("Binary address: "+bin_str);
		
		var bin_nm = subn.get_binary_netm();		
		console.log("Binary netmask: "+bin_nm+", "+IPv4Subnet.bin2dot_decimal(bin_nm));
		
		var bin_broadcast = subn.get_binary_broadcast();
		var broadcast = subn.get_broadcast();		
		console.log("Binary broadcast: "+bin_broadcast+", Broadcast IP: " + broadcast );
		
		var minhost = subn.get_binary_minhost();
		var maxhost = subn.get_binary_maxhost();
		console.log("maxhost: " + maxhost + ", IP: " + subn.get_maxhost());
		console.log("minhost: " + minhost + ", IP: " + subn.get_minhost());
		*/
		var isIn = subn.within(_ip.value);
		console.log("IP in given subnet: " + isIn.toString());
		
	}
	
}


function trigger2(){
	min_ip = document.getElementById("ip_min").value;
	max_ip = document.getElementById("ip_max").value;

	if (IPv4SubnetUtils.is_valid_address(min_ip) && IPv4SubnetUtils.is_valid_address(max_ip)){
		console.log("Both IPs are valid.");
		
		var subn = new IPv4SubnetUtils();
		subn.initialize_by_range(min_ip, max_ip);
		//console.log("IP: " + min_ip + " binary:" + subn.get_binary_minhost() );
		//console.log("IP: " + max_ip + " binary:" + subn.get_binary_maxhost() );
		//console.log("Netmask bits: " + subn.get_netmask() );
		//console.log("Binary network address: " + subn.get_binary_addr() + " : " + subn.get_address() );
		console.log("Subnet definition: "+ subn.get_subnet_definition() );
		//console.log(""+subn.get_minhost()+"-"+subn.get_maxhost());
	}
}



