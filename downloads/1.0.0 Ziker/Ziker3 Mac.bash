#!/bin/bash

# Mac version  is more anoying than the windows due to the fact that you can't resonably use any dir.
# or at least I can't.




#install Directory: ( default: $PWD/Desktop/1.0.0\ Ziker )
    
DIR = $PWD/Desktop/1.0.0\ Ziker


# Also, while you're reading this, I want to note that the default location is the desktop
# because you can't get the permission to add things to the applications folder on the student macbooks.




# Then do all of the things.
clear

if [ -e $DIR/bin ]
then

	cd $DIR/bin

	java qwerty4967.Ziker3.shell

else
	if [ -e $DIR ]
	then

		echo Ziker has been damaged. You need to reinstall it.

	else
		
		echo "Ziker could not find the files it needs to run."
		echo 
		echo It was expecting to find them at: $DIR
		echo You can change the install directory by editing this file with textEdit.
	fi

	# idle.
	while true
	do

		sleep 60

	done
fi

