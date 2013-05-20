<?php

$first= str_replace("%20"," ", $_GET['time']);
$uid= $_GET['uid'];
$day= $_GET['day'];
$note= $_GET['note'];
$score= $_GET['score'];
$score2= $_GET['report'];
$filename = 'data/uid'.$uid.'-day'.$day.'.selfreport.5min.csv';

if (file_exists($filename))
{
$lines = file($filename);
$finalLines[0]= $lines[0];
$finalCSV= "";
$didweaddit= false;

for($i=1; $i<count($lines)-1; $i++)
{
    $this_time= substr($lines[$i],2,19);
    $next_time= substr($lines[$i+1],2,19);
    
    $hour = substr($lines[$i],13,8);
    $parse = array();
    $hour= str_replace(".","0",$hour);
    if (!preg_match ('#^(?<hours>[\d]{2}):(?<mins>[\d]{2}):(?<secs>[\d]{2})$#',$hour,$parse)) {
         // Throw error, exception, etc
         throw new RuntimeException ("orig Hour Format not valid");
    }
    $this_time = (int) $parse['hours'] * 3600 + (int) $parse['mins'] * 60 + (int) $parse['secs'];
    
    $hour = substr($lines[$i+1],13,8);
    $parse = array();
    $hour= str_replace(".","0",$hour);
    if (!preg_match ('#^(?<hours>[\d]{2}):(?<mins>[\d]{2}):(?<secs>[\d]{2})$#',$hour,$parse)) {
         // Throw error, exception, etc
         throw new RuntimeException ("orig Hour Format not valid");
    }
    $next_time = (int) $parse['hours'] * 3600 + (int) $parse['mins'] * 60 + (int) $parse['secs'];
    
    $hour = substr($first,11,8);
    $parse = array();
    if (!preg_match ('#^(?<hours>[\d]{2}):(?<mins>[\d]{2}):(?<secs>[\d]{2})$#',$hour,$parse)) {
         // Throw error, exception, etc
         throw new RuntimeException ("first Hour Format not valid");
    }
    $first_time = (int) $parse['hours'] * 3600 + (int) $parse['mins'] * 60 + (int) $parse['secs'];
    
    if(intval($this_time)<intval($first_time) && intval($next_time)>intval($first_time))
    {
    //array_push($finalLines, $uid.','.$first.','.$score.','.$score2.','.$note);
    $didweaddit= true;
    }
    
    array_push($finalLines, $lines[$i]);
}

array_push($finalLines, $lines[count($lines)-1]);


//if(!$didweaddit)
array_push($finalLines, $uid.','.$first.','.$score.','.$score2.','.$note);
file_put_contents($filename,"");

$fp=fopen($filename,"w+");
foreach($finalLines as $key => $value){
fwrite($fp,$value);
}

}

?>