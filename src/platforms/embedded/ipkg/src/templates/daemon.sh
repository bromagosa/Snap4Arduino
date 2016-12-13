#!/bin/ash
# Snap4Arduino daemon script
# description: I check for an autorunnable Snap4Arduino project on startup,
#              and run it if I can. I also make sure the websockets server is
#              always up.
# processname: snap4arduino-daemon

DAEMON_PATH="/usr/share/snap4arduino"

DAEMON="node daemon.js"
DAEMONOPTS="--ws"

NAME=snap4arduino-daemon
DESC="Snap4Arduino daemon"
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME

case "$1" in
    enable)
        # just do nothing, the OpenWRT system expects us to
        # support this param
    ;;
    start)
        printf "%-50s" "Starting $NAME..."
        cd $DAEMON_PATH
        PID=`$DAEMON $DAEMONOPTS > /dev/null 2>&1 & echo $!`
        #echo "Saving PID" $PID " to " $PIDFILE
        if [ -z $PID ]; then
            printf "%s\n" "Fail"
        else
            echo $PID > $PIDFILE
            printf "%s\n" "Ok"
        fi
        ;;
    status)
        printf "%-50s" "Checking $NAME..."
        if [ -f $PIDFILE ]; then
            PID=`cat $PIDFILE`
            if [ -z "`ps axf | grep ${PID} | grep -v grep`" ]; then
                printf "%s\n" "Process dead but pidfile exists"
            else
                echo "Running"
            fi
        else
            printf "%s\n" "Service not running"
        fi
        ;;
    stop)
        printf "%-50s" "Stopping $NAME"
        PID=`cat $PIDFILE`
        cd $DAEMON_PATH
        if [ -f $PIDFILE ]; then
            kill -HUP $PID
            printf "%s\n" "Ok"
            rm -f $PIDFILE
        else
            printf "%s\n" "pidfile not found"
        fi
        ;;

    restart)
        $0 stop
        $0 start
        ;;

    *)
        echo "Usage: $0 {status|start|stop|restart}"
        exit 1
esac
