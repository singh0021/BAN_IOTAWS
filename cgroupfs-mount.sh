#!/bin/sh
set -e

# for simplicity this script provides no flexibility

# if cgroup is mounted by fstab, don't run
# don't get too smart - bail on any uncommented entry with 'cgroup' in it
if grep -v '^#' /etc/fstab | grep -q cgroup; then
	echo 'cgroups mounted from fstab, not mounting /sys/fs/cgroup'
	exit 0
fi

# kernel provides cgroups?
if [ ! -e /proc/cgroups ]; then
	exit 0
fi

# if we don't even have the directory we need, something else must be wrong
if [ ! -d /sys/fs/cgroup ]; then
	exit 0
fi

# mount /sys/fs/cgroup if not already done
if ! mountpoint -q /sys/fs/cgroup; then
	mount -t tmpfs -o uid=0,gid=0,mode=0755 cgroup /sys/fs/cgroup
fi

cd /sys/fs/cgroup

# get/mount list of enabled cgroup controllers
for sys in $(awk '!/^#/ { if ($4 == 1) print $1 }' /proc/cgroups); do
	mkdir -p $sys
	if ! mountpoint -q $sys; then
		if ! mount -n -t cgroup -o $sys cgroup $sys; then
			rmdir $sys || true
		fi
	fi
done


exit 0