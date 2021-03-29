refs=$(git rev-list --all)

threshold=10
count=0

for ref in $refs
do

    stat=$(git diff --shortstat $ref) # x files changed, y insertions(+), z deletions(-)
    IFS=', ' read -r -a arr <<< $(echo $stat | sed 's/[^0-9,]*//g')

    if [ $((${arr[1]} + ${arr[2]})) -ge $threshold ]
    then
        count=$((count+1))
    fi

done

echo "$count commits matter."
