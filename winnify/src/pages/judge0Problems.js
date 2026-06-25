export const PROBLEMS = [
  {
    id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", solved: false,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer in any order.`,
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists."],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6",     output: "[1,2]" },
    ],
    testCases: [
      { input: "2 7 11 15\n9",  expected: "[0, 1]" },
      { input: "3 2 4\n6",      expected: "[1, 2]" },
      { input: "3 3\n6",        expected: "[0, 1]" },
    ],
    hints: ["Use a hash map to store each number and its index.", "For each x, check if (target - x) already exists in the map."],
    solutions: {
      71: `nums = list(map(int, input().split()))\ntarget = int(input())\nseen = {}\nfor i, n in enumerate(nums):\n    diff = target - n\n    if diff in seen:\n        print([seen[diff], i])\n        break\n    seen[n] = i`,
      63: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst nums=lines[0].split(' ').map(Number), target=Number(lines[1]);\nconst map=new Map();\nfor(let i=0;i<nums.length;i++){\n  const d=target-nums[i];\n  if(map.has(d)){console.log([map.get(d),i].toString());break;}\n  map.set(nums[i],i);\n}`,
    },
    boilerplate: {
      71: `nums = list(map(int, input().split()))\ntarget = int(input())\n# Write your solution here\n`,
      63: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst nums=lines[0].split(' ').map(Number), target=Number(lines[1]);\n// Write your solution here\n`,
      54: `#include<iostream>\n#include<vector>\n#include<unordered_map>\nusing namespace std;\nint main(){\n    // Write your solution here\n}`,
    },
    defaultStdin: "2 7 11 15\n9",
  },
  {
    id: 2, title: "Reverse a String", difficulty: "Easy", category: "Strings", solved: false,
    description: `Write a function that reverses a string.\n\nThe input is given as a single line string. Print the reversed string.`,
    constraints: ["1 ≤ s.length ≤ 10⁵"],
    examples: [{ input: "hello", output: "olleh" }, { input: "Hannah", output: "hannaH" }],
    testCases: [
      { input: "hello",   expected: "olleh" },
      { input: "world",   expected: "dlrow" },
      { input: "racecar", expected: "racecar" },
    ],
    hints: ["Use two pointers — one at start, one at end.", "Swap and move inward."],
    solutions: { 71: `print(input()[::-1])`, 63: `const s=require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log(s.split('').reverse().join(''));` },
    boilerplate: { 71: `s = input()\n# Reverse s here\n`, 63: `const s=require('fs').readFileSync('/dev/stdin','utf8').trim();\n// Reverse s here\n` },
    defaultStdin: "hello",
  },
  {
    id: 3, title: "FizzBuzz", difficulty: "Easy", category: "Math", solved: false,
    description: `Given an integer \`n\`, print each number from 1 to n on a new line.\n\n- Print **"FizzBuzz"** if divisible by both 3 and 5.\n- Print **"Fizz"** if divisible by 3.\n- Print **"Buzz"** if divisible by 5.\n- Otherwise print the number.`,
    constraints: ["1 ≤ n ≤ 10⁴"],
    examples: [{ input: "5", output: "1\n2\nFizz\n4\nBuzz" }],
    testCases: [
      { input: "3",  expected: "1\n2\nFizz" },
      { input: "5",  expected: "1\n2\nFizz\n4\nBuzz" },
      { input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
    ],
    hints: ["Check divisibility by 15 first.", "Use the modulo operator %."],
    solutions: { 71: `n=int(input())\nfor i in range(1,n+1):\n    if i%15==0:print("FizzBuzz")\n    elif i%3==0:print("Fizz")\n    elif i%5==0:print("Buzz")\n    else:print(i)` },
    boilerplate: { 71: `n = int(input())\nfor i in range(1, n+1):\n    pass  # Write here\n` },
    defaultStdin: "15",
  },
  {
    id: 4, title: "Valid Palindrome", difficulty: "Easy", category: "Strings", solved: false,
    description: `A phrase is a palindrome if, after converting all uppercase to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nPrint \`true\` or \`false\`.`,
    constraints: ["1 ≤ s.length ≤ 2×10⁵"],
    examples: [
      { input: "A man, a plan, a canal: Panama", output: "true" },
      { input: "race a car", output: "false" },
    ],
    testCases: [
      { input: "A man, a plan, a canal: Panama", expected: "true" },
      { input: "race a car",                    expected: "false" },
      { input: "Was it a car or a cat I saw?",  expected: "true" },
    ],
    hints: ["Strip non-alphanumeric and lowercase.", "Compare with its reverse."],
    solutions: { 71: `s=input()\nc=''.join(x.lower() for x in s if x.isalnum())\nprint(str(c==c[::-1]).lower())` },
    boilerplate: { 71: `s = input()\n# Check palindrome here\n` },
    defaultStdin: "A man, a plan, a canal: Panama",
  },
  {
    id: 5, title: "Maximum Subarray", difficulty: "Medium", category: "Dynamic Programming", solved: false,
    description: `Given an integer array \`nums\`, find the subarray with the largest sum and return its sum.\n\n*(Kadane's Algorithm)*`,
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    examples: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "[4,-1,2,1] has sum 6." },
    ],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expected: "6" },
      { input: "1",                      expected: "1" },
      { input: "-1 -2 -3",               expected: "-1" },
    ],
    hints: ["Maintain a running sum, reset when negative.", "currentMax = max(num, currentMax + num)."],
    solutions: { 71: `nums=list(map(int,input().split()))\ncur=best=nums[0]\nfor n in nums[1:]:\n    cur=max(n,cur+n)\n    best=max(best,cur)\nprint(best)` },
    boilerplate: { 71: `nums = list(map(int, input().split()))\n# Kadane's algorithm here\n` },
    defaultStdin: "-2 1 -3 4 -1 2 1 -5 4",
  },
  {
    id: 6, title: "Climbing Stairs", difficulty: "Easy", category: "Dynamic Programming", solved: false,
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.\nEach time you can climb 1 or 2 steps.\nIn how many distinct ways can you climb to the top?`,
    constraints: ["1 ≤ n ≤ 45"],
    examples: [{ input: "2", output: "2" }, { input: "3", output: "3" }],
    testCases: [
      { input: "1", expected: "1" },
      { input: "2", expected: "2" },
      { input: "5", expected: "8" },
    ],
    hints: ["It's Fibonacci! ways(n) = ways(n-1) + ways(n-2)."],
    solutions: { 71: `n=int(input())\na,b=1,1\nfor _ in range(n-1):a,b=b,a+b\nprint(a)` },
    boilerplate: { 71: `n = int(input())\n# Count ways here\n` },
    defaultStdin: "5",
  },
  {
    id: 7, title: "Binary Search", difficulty: "Easy", category: "Searching", solved: false,
    description: `Given a sorted array of distinct integers and a target value, return the index if found, else return -1.\n\nFirst line: space-separated sorted array. Second line: target.`,
    constraints: ["1 ≤ nums.length ≤ 10⁴"],
    examples: [{ input: "-1 0 3 5 9 12\n9", output: "4" }],
    testCases: [
      { input: "-1 0 3 5 9 12\n9",  expected: "4" },
      { input: "-1 0 3 5 9 12\n2",  expected: "-1" },
      { input: "1 3 5 7 9\n7",      expected: "3" },
    ],
    hints: ["lo=0, hi=len-1. Compute mid=(lo+hi)//2.", "If nums[mid]<target → lo=mid+1, else hi=mid-1."],
    solutions: { 71: `nums=list(map(int,input().split()))\ntarget=int(input())\nlo,hi=0,len(nums)-1\nwhile lo<=hi:\n    mid=(lo+hi)//2\n    if nums[mid]==target:print(mid);exit()\n    elif nums[mid]<target:lo=mid+1\n    else:hi=mid-1\nprint(-1)` },
    boilerplate: { 71: `nums=list(map(int,input().split()))\ntarget=int(input())\n# Binary search here\n` },
    defaultStdin: "-1 0 3 5 9 12\n9",
  },
  {
    id: 8, title: "Valid Brackets", difficulty: "Easy", category: "Stacks", solved: false,
    description: `Given a string containing only \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if it is valid.\n\nPrint \`true\` or \`false\`.`,
    constraints: ["1 ≤ s.length ≤ 10⁴"],
    examples: [{ input: "()", output: "true" }, { input: "(]", output: "false" }],
    testCases: [
      { input: "()",      expected: "true" },
      { input: "()[]{}", expected: "true" },
      { input: "(]",     expected: "false" },
      { input: "({[]})", expected: "true" },
    ],
    hints: ["Use a stack. Push opening brackets.", "On closing bracket, check if top matches."],
    solutions: { 71: `s=input()\nst=[]\np={')':'(',']':'[','}':'{'}\nfor c in s:\n    if c in'([{':st.append(c)\n    elif not st or st[-1]!=p[c]:print('false');exit()\n    else:st.pop()\nprint('true'if not st else'false')` },
    boilerplate: { 71: `s = input()\n# Validate brackets here\n` },
    defaultStdin: "({[]})",
  },
  {
    id: 9, title: "Fibonacci Sequence", difficulty: "Easy", category: "Math", solved: false,
    description: `Print the first \`n\` Fibonacci numbers, space-separated.\n\nStarting from 0: 0 1 1 2 3 5 8 …`,
    constraints: ["1 ≤ n ≤ 50"],
    examples: [{ input: "7", output: "0 1 1 2 3 5 8" }],
    testCases: [
      { input: "1", expected: "0" },
      { input: "5", expected: "0 1 1 2 3" },
      { input: "7", expected: "0 1 1 2 3 5 8" },
    ],
    hints: ["a,b = 0,1 → a,b = b,a+b each step."],
    solutions: { 71: `n=int(input())\na,b=0,1\nres=[]\nfor _ in range(n):res.append(a);a,b=b,a+b\nprint(*res)` },
    boilerplate: { 71: `n = int(input())\n# Print first n Fibonacci numbers\n` },
    defaultStdin: "7",
  },
  {
    id: 10, title: "Maximum Subarray", difficulty: "Medium", category: "Arrays", solved: false,
    title: "Rotate Array", difficulty: "Medium", category: "Arrays", solved: false,
    description: `Given an array and k, rotate it to the right by k steps.\n\nFirst line: array. Second line: k.`,
    constraints: ["1 ≤ nums.length ≤ 10⁵", "0 ≤ k ≤ 10⁵"],
    examples: [{ input: "1 2 3 4 5 6 7\n3", output: "5 6 7 1 2 3 4" }],
    testCases: [
      { input: "1 2 3 4 5 6 7\n3", expected: "5 6 7 1 2 3 4" },
      { input: "1 2\n3",           expected: "2 1" },
    ],
    hints: ["k %= len(nums)", "result = nums[-k:] + nums[:-k]"],
    solutions: { 71: `nums=list(map(int,input().split()))\nk=int(input())%len(nums)\nprint(*(nums[-k:]+nums[:-k]))` },
    boilerplate: { 71: `nums=list(map(int,input().split()))\nk=int(input())\n# Rotate here\n` },
    defaultStdin: "1 2 3 4 5 6 7\n3",
  },
  {
    id: 11, title: "Count Vowels", difficulty: "Easy", category: "Strings", solved: false,
    description: `Given a string, count and print the number of vowels (a, e, i, o, u — case insensitive).`,
    constraints: ["1 ≤ s.length ≤ 10⁵"],
    examples: [{ input: "Hello World", output: "3" }],
    testCases: [
      { input: "Hello World", expected: "3" },
      { input: "aeiou",       expected: "5" },
      { input: "rhythm",      expected: "0" },
    ],
    hints: ["Lowercase the string.", "Count chars in {'a','e','i','o','u'}."],
    solutions: { 71: `s=input().lower()\nprint(sum(c in'aeiou'for c in s))` },
    boilerplate: { 71: `s = input()\n# Count vowels here\n` },
    defaultStdin: "Hello World",
  },
  {
    id: 12, title: "Factorial", difficulty: "Easy", category: "Math", solved: false,
    description: `Given a non-negative integer n, compute and print n! (factorial).`,
    constraints: ["0 ≤ n ≤ 20"],
    examples: [{ input: "5", output: "120" }],
    testCases: [
      { input: "0",  expected: "1" },
      { input: "5",  expected: "120" },
      { input: "10", expected: "3628800" },
    ],
    hints: ["Multiply 1×2×3×…×n.", "0! = 1."],
    solutions: { 71: `import math\nprint(math.factorial(int(input())))` },
    boilerplate: { 71: `n = int(input())\n# Compute n! here\n` },
    defaultStdin: "5",
  },
  {
    id: 13, title: "Prime Check", difficulty: "Easy", category: "Math", solved: false,
    description: `Given an integer n, print "Prime" if it is prime, else "Not Prime".`,
    constraints: ["1 ≤ n ≤ 10⁶"],
    examples: [{ input: "7", output: "Prime" }, { input: "10", output: "Not Prime" }],
    testCases: [
      { input: "2",  expected: "Prime" },
      { input: "17", expected: "Prime" },
      { input: "15", expected: "Not Prime" },
    ],
    hints: ["Only check divisors up to √n."],
    solutions: { 71: `n=int(input())\nif n<2:print("Not Prime")\nelse:\n    for i in range(2,int(n**0.5)+1):\n        if n%i==0:print("Not Prime");exit()\n    print("Prime")` },
    boilerplate: { 71: `n = int(input())\n# Check prime here\n` },
    defaultStdin: "17",
  },
  {
    id: 14, title: "Anagram Check", difficulty: "Easy", category: "Strings", solved: false,
    description: `Given two strings (one per line), print "Anagram" if they are anagrams of each other, else "Not Anagram".`,
    constraints: ["1 ≤ length ≤ 10⁵"],
    examples: [{ input: "listen\nsilent", output: "Anagram" }],
    testCases: [
      { input: "listen\nsilent", expected: "Anagram" },
      { input: "hello\nworld",   expected: "Not Anagram" },
    ],
    hints: ["Sort both and compare."],
    solutions: { 71: `a,b=input(),input()\nprint("Anagram"if sorted(a.lower())==sorted(b.lower())else"Not Anagram")` },
    boilerplate: { 71: `a = input()\nb = input()\n# Check anagram here\n` },
    defaultStdin: "listen\nsilent",
  },
  {
    id: 15, title: "Number of Islands", difficulty: "Medium", category: "Graphs", solved: false,
    description: `Given a grid of '1' (land) and '0' (water), count the number of islands using DFS.\n\nEach line of input is a row of the grid.`,
    constraints: ["1 ≤ m,n ≤ 300"],
    examples: [{ input: "11110\n11010\n11000\n00000", output: "1" }],
    testCases: [
      { input: "11110\n11010\n11000\n00000", expected: "1" },
      { input: "11000\n11000\n00100\n00011", expected: "3" },
    ],
    hints: ["DFS: when you find '1', flood-fill it to '0'.", "Each DFS call = one island."],
    solutions: { 71: `import sys\ngrid=[list(l)for l in sys.stdin.read().splitlines()]\nm,n=len(grid),len(grid[0])\ndef dfs(i,j):\n    if i<0 or i>=m or j<0 or j>=n or grid[i][j]!='1':return\n    grid[i][j]='0'\n    for di,dj in[(-1,0),(1,0),(0,-1),(0,1)]:dfs(i+di,j+dj)\ncount=0\nfor i in range(m):\n    for j in range(n):\n        if grid[i][j]=='1':dfs(i,j);count+=1\nprint(count)` },
    boilerplate: { 71: `import sys\ngrid=[list(l)for l in sys.stdin.read().splitlines()]\n# Count islands here\n` },
    defaultStdin: "11110\n11010\n11000\n00000",
  },

  // ── HARD / MAANG-level ────────────────────────────────────────────────────

  {
    id: 16, title: "Trapping Rain Water", difficulty: "Hard", category: "Arrays", solved: false,
    description: `## Problem

Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

## Background

This is one of the most iconic problems in competitive programming and frequently appears in FAANG interviews. The key insight is that the amount of water above any bar is determined by the **minimum** of the maximum heights to its left and right, minus the height of the bar itself.

## Approach

There are three classic approaches:
1. **Brute Force** — O(n²): For each index compute leftMax and rightMax
2. **Prefix/Suffix arrays** — O(n) time, O(n) space
3. **Two Pointers** — O(n) time, O(1) space ← optimal

## Input Format

A single line of space-separated non-negative integers representing heights.

## Output Format

A single integer — total units of trapped water.`,
    constraints: [
      "n == height.length",
      "1 ≤ n ≤ 2×10⁴",
      "0 ≤ height[i] ≤ 10⁵",
    ],
    examples: [
      {
        input: "0 1 0 2 1 0 1 3 2 1 2 1",
        output: "6",
        explanation: "The elevation map traps 6 units of rain water. Between the bars at index 3 (height 2) and index 7 (height 3), water is trapped at indices 4,5,6.",
      },
      {
        input: "4 2 0 3 2 5",
        output: "9",
        explanation: "Water is trapped in the valley: 2+2+0+1+2 = 9 units. The right boundary (height 5) determines the fill level on the right side.",
      },
      {
        input: "3 0 2 0 4",
        output: "7",
        explanation: "Between height 3 and 4: indices 1,2,3 trap 3+1+3 = 7 units total.",
      },
    ],
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expected: "6" },
      { input: "4 2 0 3 2 5",              expected: "9" },
      { input: "3 0 2 0 4",                expected: "7" },
    ],
    hints: [
      "Two-pointer approach: maintain leftMax and rightMax as you shrink from both ends.",
      "If leftMax < rightMax, the left side is the bottleneck — process the left pointer.",
      "water += min(leftMax, rightMax) - height[i] for each index i.",
      "This runs in O(n) time and O(1) space — no extra arrays needed.",
    ],
    solutions: {
      71: `h=list(map(int,input().split()))
l,r=0,len(h)-1
lm=rm=res=0
while l<r:
    if h[l]<h[r]:
        lm=max(lm,h[l]);res+=lm-h[l];l+=1
    else:
        rm=max(rm,h[r]);res+=rm-h[r];r-=1
print(res)`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    vector<int>h;int x;
    while(cin>>x)h.push_back(x);
    int l=0,r=h.size()-1,lm=0,rm=0,res=0;
    while(l<r){
        if(h[l]<h[r]){lm=max(lm,h[l]);res+=lm-h[l];l++;}
        else{rm=max(rm,h[r]);res+=rm-h[r];r--;}
    }
    cout<<res;
}`,
    },
    boilerplate: {
      71: `h = list(map(int, input().split()))
# Two-pointer approach
l, r = 0, len(h) - 1
left_max = right_max = result = 0
while l < r:
    pass  # fill in logic
print(result)`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    vector<int> h;
    int x;
    while(cin >> x) h.push_back(x);
    // Two-pointer trap water
    cout << 0;
}`,
    },
    defaultStdin: "0 1 0 2 1 0 1 3 2 1 2 1",
  },

  {
    id: 17, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Arrays", solved: false,
    description: `## Problem

Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity must be **O(log(m + n))**.

## Why It's Hard

The naive solution — merge and find middle — is O(m+n). To achieve O(log(m+n)) you must use **binary search on the partition point** of the smaller array.

## Key Insight

A valid partition of the merged array exists when:
- \`maxLeft1 ≤ minRight2\`  and  \`maxLeft2 ≤ minRight1\`

Binary-search the partition index \`i\` in \`nums1\` (always binary search the smaller array). Derive \`j = (m + n + 1) / 2 - i\`.

## Input Format

- Line 1: space-separated integers of nums1 (or "empty" for empty array)
- Line 2: space-separated integers of nums2
- Line 3: total length m+n (to know if combined length is odd or even)

## Output Format

The median as a float. If the result is a whole number print it with one decimal (e.g. \`2.0\`).`,
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 ≤ m ≤ 1000",
      "0 ≤ n ≤ 1000",
      "1 ≤ m + n ≤ 2000",
      "-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶",
    ],
    examples: [
      {
        input: "1 3\n2\n3",
        output: "2.0",
        explanation: "Merged array = [1,2,3]. Median is 2.",
      },
      {
        input: "1 2\n3 4\n4",
        output: "2.5",
        explanation: "Merged array = [1,2,3,4]. Median = (2+3)/2 = 2.5.",
      },
      {
        input: "0 0\n0 0\n4",
        output: "0.0",
        explanation: "All zeros — median is 0.",
      },
    ],
    testCases: [
      { input: "1 3\n2\n3",   expected: "2.0" },
      { input: "1 2\n3 4\n4", expected: "2.5" },
      { input: "0 0\n0 0\n4", expected: "0.0" },
    ],
    hints: [
      "Always binary search the shorter array to keep O(log(min(m,n))).",
      "Partition nums1 at index i, nums2 at j = half - i (where half = (m+n+1)//2).",
      "Valid partition: maxLeft1 <= minRight2 AND maxLeft2 <= minRight1.",
      "If maxLeft1 > minRight2 → move i left. If maxLeft2 > minRight1 → move i right.",
      "For even total length, median = (max(maxLeft1,maxLeft2) + min(minRight1,minRight2)) / 2.",
    ],
    solutions: {
      71: `import sys
lines=sys.stdin.read().splitlines()
A=list(map(int,lines[0].split())) if lines[0]!='empty' else []
B=list(map(int,lines[1].split()))
if len(A)>len(B):A,B=B,A
m,n=len(A),len(B)
half=(m+n+1)//2
lo,hi=0,m
while lo<=hi:
    i=(lo+hi)//2
    j=half-i
    maxL1=A[i-1]if i>0 else float('-inf')
    minR1=A[i]if i<m else float('inf')
    maxL2=B[j-1]if j>0 else float('-inf')
    minR2=B[j]if j<n else float('inf')
    if maxL1<=minR2 and maxL2<=minR1:
        ml=max(maxL1,maxL2)
        if(m+n)%2:print(float(ml));break
        print((ml+min(minR1,minR2))/2);break
    elif maxL1>minR2:hi=i-1
    else:lo=i+1`,
    },
    boilerplate: {
      71: `import sys
lines = sys.stdin.read().splitlines()
A = list(map(int, lines[0].split())) if lines[0] != 'empty' else []
B = list(map(int, lines[1].split()))
# Binary search on partition
# Ensure A is the smaller array
if len(A) > len(B):
    A, B = B, A
m, n = len(A), len(B)
# Your O(log(min(m,n))) solution here
`,
    },
    defaultStdin: "1 2\n3 4\n4",
  },

  {
    id: 18, title: "Minimum Window Substring", difficulty: "Hard", category: "Strings", solved: false,
    description: `## Problem

Given two strings \`s\` and \`t\`, return the **minimum window substring** of \`s\` such that every character in \`t\` (including duplicates) is included in the window.

If there is no such window, return an empty string \`""\`.

## Technique: Sliding Window + Frequency Map

This is the archetypal **sliding window** problem. You expand the right pointer until the window is valid (contains all chars of \`t\`), then contract the left pointer to minimize the window.

## Algorithm

1. Build a frequency map \`need\` for \`t\`.
2. Maintain \`have\` (satisfied character counts) and \`required\` (len of unique chars in t).
3. Expand right pointer — when \`need[c]\` drops to 0, increment \`have\`.
4. When \`have == required\`, try shrinking left. Track best window.
5. When shrinking makes window invalid, expand again.

## Input Format

- Line 1: string \`s\`
- Line 2: string \`t\`

## Output Format

The minimum window substring, or empty string if none.`,
    constraints: [
      "m == s.length",
      "n == t.length",
      "1 ≤ m, n ≤ 10⁵",
      "s and t consist of uppercase and lowercase English letters.",
      "The answer is guaranteed to be unique.",
    ],
    examples: [
      {
        input: "ADOBECODEBANC\nABC",
        output: "BANC",
        explanation: "The minimum window containing A, B, C is 'BANC' (indices 9–12). 'ADOBE' also contains them but is longer. 'ADOBEC' contains them but 'BANC' is shorter.",
      },
      {
        input: "a\na",
        output: "a",
        explanation: "s itself is the only window.",
      },
      {
        input: "a\nb",
        output: "",
        explanation: "'b' never appears in s, so no valid window exists.",
      },
      {
        input: "AABBCC\nABC",
        output: "ABBC",
        explanation: "Sliding from index 0: AABB misses C, AABBC has all but length 5, AABBCC length 6. Shrink left: ABBC length 4 — optimal.",
      },
    ],
    testCases: [
      { input: "ADOBECODEBANC\nABC", expected: "BANC" },
      { input: "a\na",               expected: "a" },
      { input: "a\nb",               expected: "" },
    ],
    hints: [
      "Use two pointers l, r and a Counter for needs.",
      "Track 'formed' — how many unique chars from t are currently satisfied.",
      "Expand r. When s[r] in need and freq[s[r]] == need[s[r]], increment formed.",
      "When formed == required, record window, then shrink l.",
      "Time complexity O(|s| + |t|) — each character is visited at most twice.",
    ],
    solutions: {
      71: `from collections import Counter
import sys
lines=sys.stdin.read().splitlines()
s,t=lines[0],lines[1]
if not t or not s:print('');exit()
need=Counter(t)
req=len(need)
formed=0
window={}
ans=(float('inf'),0,0)
l=0
for r,c in enumerate(s):
    window[c]=window.get(c,0)+1
    if c in need and window[c]==need[c]:formed+=1
    while formed==req:
        if r-l+1<ans[0]:ans=(r-l+1,l,r)
        lc=s[l];window[lc]-=1
        if lc in need and window[lc]<need[lc]:formed-=1
        l+=1
print('' if ans[0]==float('inf') else s[ans[1]:ans[2]+1])`,
    },
    boilerplate: {
      71: `from collections import Counter
import sys
lines = sys.stdin.read().splitlines()
s, t = lines[0], lines[1]
# Sliding window approach
# need = Counter(t)
# Expand right, shrink left when window is valid
result = ""
print(result)`,
    },
    defaultStdin: "ADOBECODEBANC\nABC",
  },

  {
    id: 19, title: "Edit Distance", difficulty: "Hard", category: "Dynamic Programming", solved: false,
    description: `## Problem

Given two strings \`word1\` and \`word2\`, return the **minimum number of operations** required to convert \`word1\` to \`word2\`.

Allowed operations (each costs 1):
- **Insert** a character
- **Delete** a character
- **Replace** a character

Also known as the **Levenshtein Distance**, this problem is foundational in NLP, spell-checkers, DNA analysis, and diff algorithms.

## 2D DP Formulation

Define \`dp[i][j]\` = min operations to convert \`word1[0..i-1]\` to \`word2[0..j-1]\`.

**Base cases:**
- \`dp[i][0] = i\` (delete i chars)
- \`dp[0][j] = j\` (insert j chars)

**Recurrence:**
\`\`\`
if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]         # no operation needed
else:
    dp[i][j] = 1 + min(
        dp[i-1][j],    # delete from word1
        dp[i][j-1],    # insert into word1
        dp[i-1][j-1]   # replace
    )
\`\`\`

## Input Format

- Line 1: word1
- Line 2: word2

## Output Format

Single integer — minimum edit distance.`,
    constraints: [
      "0 ≤ word1.length, word2.length ≤ 500",
      "word1 and word2 consist of lowercase English letters.",
    ],
    examples: [
      {
        input: "horse\nros",
        output: "3",
        explanation: "horse → rorse (replace 'h' with 'r') → rose (delete 'r') → ros (delete 'e'). 3 operations.",
      },
      {
        input: "intention\nexecution",
        output: "5",
        explanation: "intention → inention (delete t) → enention (replace i→e) → exention (replace n→x) → exection (replace n→c) → execution (insert u). 5 operations.",
      },
      {
        input: "abc\nabc",
        output: "0",
        explanation: "Strings are equal — zero operations needed.",
      },
      {
        input: "saturday\nsunday",
        output: "3",
        explanation: "saturday → sturday (delete a) → sunday (replace tur→un). Classic DP example.",
      },
    ],
    testCases: [
      { input: "horse\nros",         expected: "3" },
      { input: "intention\nexecution", expected: "5" },
      { input: "abc\nabc",           expected: "0" },
    ],
    hints: [
      "Build a (m+1) x (n+1) DP table where m=len(word1), n=len(word2).",
      "Fill row 0 with 0..n and column 0 with 0..m (base cases).",
      "For each cell: if chars match, copy diagonal. Otherwise 1 + min(left, top, diagonal).",
      "Space-optimized: you only ever need the previous row — use a 1D rolling array.",
      "Final answer is dp[m][n].",
    ],
    solutions: {
      71: `import sys
w1,w2=sys.stdin.read().splitlines()[:2]
m,n=len(w1),len(w2)
dp=list(range(n+1))
for i in range(1,m+1):
    prev=dp[:]
    dp[0]=i
    for j in range(1,n+1):
        if w1[i-1]==w2[j-1]:dp[j]=prev[j-1]
        else:dp[j]=1+min(prev[j],dp[j-1],prev[j-1])
print(dp[n])`,
    },
    boilerplate: {
      71: `import sys
w1, w2 = sys.stdin.read().splitlines()[:2]
m, n = len(w1), len(w2)
# Build dp table of size (m+1) x (n+1)
# dp[i][j] = min ops to convert w1[:i] -> w2[:j]
dp = [[0]*(n+1) for _ in range(m+1)]
# Base cases: dp[i][0] = i, dp[0][j] = j
# Fill recurrence here
print(dp[m][n])`,
    },
    defaultStdin: "horse\nros",
  },

  {
    id: 20, title: "Largest Rectangle in Histogram", difficulty: "Hard", category: "Stacks", solved: false,
    description: `## Problem

Given an array of integers \`heights\` representing the histogram's bar heights where the width of each bar is 1, return the **area of the largest rectangle** in the histogram.

## Why This Is a Classic

This problem appears in Google, Amazon, and Meta interviews. The optimal O(n) solution uses a **monotonic stack** — a stack that always remains sorted (in this case, increasing order of heights).

## Monotonic Stack Approach

Maintain a stack of bar indices in increasing order of height.

When you encounter a bar shorter than the stack's top:
1. Pop the top bar — it's the **height** of a candidate rectangle.
2. The **width** extends from the new stack top (left boundary) to the current index (right boundary).
3. Compute area and update max.

After scanning all bars, pop remaining bars using n as the right boundary.

## Input Format

A single line of space-separated non-negative integers.

## Output Format

A single integer — maximum rectangle area.`,
    constraints: [
      "1 ≤ heights.length ≤ 10⁵",
      "0 ≤ heights[i] ≤ 10⁴",
    ],
    examples: [
      {
        input: "2 1 5 6 2 3",
        output: "10",
        explanation: "The largest rectangle has height 5 and width 2 (bars at index 2 and 3), giving area 10. Other candidates: height 2 width 5 = 10 as well, height 3 width 2 = 6.",
      },
      {
        input: "2 4",
        output: "4",
        explanation: "Largest single bar has area 4. Taking both bars at height 2 gives area 4 as well.",
      },
      {
        input: "6 2 5 4 5 1 6",
        output: "12",
        explanation: "Bars 2,3,4 (heights 5,4,5) form a rectangle of height 4 and width 3 = 12.",
      },
      {
        input: "1 1 1 1 1 1",
        output: "6",
        explanation: "All bars have height 1 so the entire histogram forms a 6×1 rectangle.",
      },
    ],
    testCases: [
      { input: "2 1 5 6 2 3",   expected: "10" },
      { input: "2 4",           expected: "4" },
      { input: "6 2 5 4 5 1 6", expected: "12" },
    ],
    hints: [
      "Use a monotonic increasing stack storing (index, height) pairs.",
      "When heights[i] < stack top height: pop and compute area = height × (i - stack_top_index - 1).",
      "After the loop, pop all remaining bars using n as right boundary.",
      "Append a sentinel bar of height 0 at the end to flush the stack cleanly.",
      "Time: O(n), Space: O(n).",
    ],
    solutions: {
      71: `h=list(map(int,input().split()))
h.append(0)
st=[]
mx=0
for i,v in enumerate(h):
    start=i
    while st and st[-1][1]>v:
        idx,ht=st.pop()
        mx=max(mx,ht*(i-idx))
        start=idx
    st.append((start,v))
print(mx)`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    vector<int>h;int x;
    while(cin>>x)h.push_back(x);
    h.push_back(0);
    stack<pair<int,int>>st;
    long long mx=0;
    for(int i=0;i<(int)h.size();i++){
        int start=i;
        while(!st.empty()&&st.top().second>h[i]){
            auto[idx,ht]=st.top();st.pop();
            mx=max(mx,(long long)ht*(i-idx));
            start=idx;
        }
        st.push({start,h[i]});
    }
    cout<<mx;
}`,
    },
    boilerplate: {
      71: `h = list(map(int, input().split()))
h.append(0)  # sentinel
stack = []   # stores (start_index, height)
max_area = 0
for i, v in enumerate(h):
    start = i
    while stack and stack[-1][1] > v:
        pass  # pop and compute area
    stack.append((start, v))
print(max_area)`,
    },
    defaultStdin: "2 1 5 6 2 3",
  },

  {
    id: 21, title: "Word Ladder", difficulty: "Hard", category: "Graphs", solved: false,
    description: `## Problem

A **transformation sequence** from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence:

\`beginWord → s₁ → s₂ → … → sₖ\`

where:
- Every adjacent pair differs by exactly **one letter**.
- Every \`sᵢ\` (for i ≥ 1) is in \`wordList\`.

Return the **number of words in the shortest transformation sequence**, or \`0\` if no such sequence exists.

## Key Insight: BFS on Implicit Graph

Each word is a node. Two words are connected if they differ by exactly one character. BFS guarantees the shortest path.

**Optimization:** Instead of comparing every pair (O(n²)), for each word generate all possible one-letter variants using wildcards: "hit" → "\*it", "h\*t", "hi\*" — then group words by their wildcard patterns.

## Input Format

- Line 1: beginWord
- Line 2: endWord
- Line 3: space-separated wordList

## Output Format

Single integer — length of shortest transformation, or 0.`,
    constraints: [
      "1 ≤ beginWord.length ≤ 10",
      "endWord.length == beginWord.length",
      "1 ≤ wordList.length ≤ 5000",
      "wordList[i].length == beginWord.length",
      "beginWord, endWord, and wordList[i] consist of lowercase English letters.",
      "beginWord != endWord",
      "All words in wordList are unique.",
    ],
    examples: [
      {
        input: "hit\ncog\nhot dot dog lot log cog",
        output: "5",
        explanation: "hit → hot → dot → dog → cog (5 words). Another path: hit → hot → lot → log → cog also length 5.",
      },
      {
        input: "hit\ncog\nhot dot dog lot log",
        output: "0",
        explanation: "'cog' is not in wordList so no valid transformation exists.",
      },
      {
        input: "a\nc\na b c",
        output: "2",
        explanation: "a → c directly (differ by 1 letter, c in wordList). Length = 2.",
      },
    ],
    testCases: [
      { input: "hit\ncog\nhot dot dog lot log cog", expected: "5" },
      { input: "hit\ncog\nhot dot dog lot log",     expected: "0" },
      { input: "a\nc\na b c",                      expected: "2" },
    ],
    hints: [
      "BFS from beginWord — each level represents one transformation step.",
      "Use a visited set to avoid re-processing words.",
      "To find neighbours: for each position, try replacing with a-z and check if result is in wordSet.",
      "Alternatively: precompute wildcard adjacency map (*it → [hit, bit, sit, …]).",
      "Return level count when endWord is dequeued. If queue empties, return 0.",
    ],
    solutions: {
      71: `from collections import deque,defaultdict
import sys
lines=sys.stdin.read().splitlines()
bw,ew=lines[0],lines[1]
wl=set(lines[2].split())
if ew not in wl:print(0);exit()
adj=defaultdict(list)
for w in list(wl)+[bw]:
    for i in range(len(w)):
        p=w[:i]+'*'+w[i+1:]
        adj[p].append(w)
q=deque([(bw,1)])
seen={bw}
while q:
    w,d=q.popleft()
    for i in range(len(w)):
        for nb in adj[w[:i]+'*'+w[i+1:]]:
            if nb==ew:print(d+1);exit()
            if nb not in seen:seen.add(nb);q.append((nb,d+1))
print(0)`,
    },
    boilerplate: {
      71: `from collections import deque, defaultdict
import sys
lines = sys.stdin.read().splitlines()
begin_word, end_word = lines[0], lines[1]
word_list = set(lines[2].split())
if end_word not in word_list:
    print(0)
else:
    # BFS — each pop is one transformation step
    queue = deque([(begin_word, 1)])
    visited = {begin_word}
    while queue:
        word, depth = queue.popleft()
        # generate neighbours here
        pass
    print(0)`,
    },
    defaultStdin: "hit\ncog\nhot dot dog lot log cog",
  },

  {
    id: 22, title: "Longest Increasing Subsequence", difficulty: "Hard", category: "Dynamic Programming", solved: false,
    description: `## Problem

Given an integer array \`nums\`, return the length of the **longest strictly increasing subsequence**.

A subsequence is derived from the array by deleting some (or no) elements without changing the order of the remaining elements.

## Two Approaches

### O(n²) DP — Classic
\`dp[i]\` = length of LIS ending at index \`i\`.
\`dp[i] = 1 + max(dp[j] for j < i if nums[j] < nums[i])\`

### O(n log n) — Patience Sorting + Binary Search (Optimal)
Maintain a \`tails\` array where \`tails[i]\` is the smallest tail element of all increasing subsequences of length \`i+1\`.

For each number:
- If it's larger than all tails → append (extend LIS)
- Otherwise → binary search for the first tail ≥ number, replace it

The length of \`tails\` at the end is the LIS length.

## Input Format

A single line of space-separated integers.

## Output Format

Single integer — LIS length.`,
    constraints: [
      "1 ≤ nums.length ≤ 2500",
      "-10⁴ ≤ nums[i] ≤ 10⁴",
    ],
    examples: [
      {
        input: "10 9 2 5 3 7 101 18",
        output: "4",
        explanation: "LIS is [2,3,7,101] or [2,3,7,18] or [2,5,7,101] — all length 4.",
      },
      {
        input: "0 1 0 3 2 3",
        output: "4",
        explanation: "LIS is [0,1,2,3] — length 4.",
      },
      {
        input: "7 7 7 7 7 7 7",
        output: "1",
        explanation: "All equal — strictly increasing subsequence has length 1.",
      },
      {
        input: "1 3 6 7 9 4 10 5 6",
        output: "6",
        explanation: "LIS: [1,3,6,7,9,10] — length 6. The 4,5,6 branch is shorter.",
      },
    ],
    testCases: [
      { input: "10 9 2 5 3 7 101 18", expected: "4" },
      { input: "0 1 0 3 2 3",         expected: "4" },
      { input: "7 7 7 7 7 7 7",       expected: "1" },
    ],
    hints: [
      "O(n²) DP: dp[i] = 1 + max(dp[j] for j<i where nums[j]<nums[i]). Answer = max(dp).",
      "O(n log n): maintain a 'tails' list. For each num, bisect_left to find insertion point.",
      "If insertion point == len(tails), append. Otherwise replace tails[pos] = num.",
      "bisect_left finds the leftmost position where num can be inserted to keep tails sorted.",
      "The tails array doesn't represent an actual subsequence — just track its length.",
    ],
    solutions: {
      71: `from bisect import bisect_left
nums=list(map(int,input().split()))
tails=[]
for n in nums:
    p=bisect_left(tails,n)
    if p==len(tails):tails.append(n)
    else:tails[p]=n
print(len(tails))`,
    },
    boilerplate: {
      71: `from bisect import bisect_left
nums = list(map(int, input().split()))
tails = []
for n in nums:
    pos = bisect_left(tails, n)
    if pos == len(tails):
        tails.append(n)
    else:
        tails[pos] = n  # replace to maintain smallest possible tails
print(len(tails))`,
    },
    defaultStdin: "10 9 2 5 3 7 101 18",
  },

  {
    id: 23, title: "Course Schedule II", difficulty: "Hard", category: "Graphs", solved: false,
    description: `## Problem

There are \`numCourses\` courses labeled \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [aᵢ, bᵢ]\` means you must take course \`bᵢ\` before course \`aᵢ\`.

Return the **ordering of courses** you should take to finish all courses. If it is impossible (cycle exists), return an empty list.

## Algorithm: Topological Sort (Kahn's BFS)

1. Build an **adjacency list** and **in-degree array**.
2. Add all nodes with in-degree 0 to a queue.
3. While queue is non-empty: dequeue a node, add to result, decrement neighbours' in-degrees.
4. When a neighbour's in-degree drops to 0, enqueue it.
5. If result length == numCourses → valid order. Otherwise → cycle detected, return [].

## Input Format

- Line 1: numCourses
- Line 2: numPrerequisites
- Next numPrerequisites lines: \`a b\` meaning take b before a

## Output Format

Space-separated course order, or "impossible" if a cycle exists.`,
    constraints: [
      "1 ≤ numCourses ≤ 2000",
      "0 ≤ prerequisites.length ≤ numCourses × (numCourses - 1)",
      "prerequisites[i].length == 2",
      "0 ≤ aᵢ, bᵢ < numCourses",
      "aᵢ ≠ bᵢ",
      "All (aᵢ, bᵢ) pairs are distinct.",
    ],
    examples: [
      {
        input: "4\n4\n1 0\n2 0\n3 1\n3 2",
        output: "0 1 2 3",
        explanation: "Take 0 first (no prereqs), then 1 and 2 (both need 0), then 3 (needs 1 and 2). Order: 0→1→2→3 or 0→2→1→3.",
      },
      {
        input: "2\n2\n1 0\n0 1",
        output: "impossible",
        explanation: "Course 0 requires 1 and course 1 requires 0 — circular dependency, impossible.",
      },
      {
        input: "2\n1\n1 0",
        output: "0 1",
        explanation: "Take 0 first, then 1.",
      },
    ],
    testCases: [
      { input: "4\n4\n1 0\n2 0\n3 1\n3 2", expected: "0 1 2 3" },
      { input: "2\n2\n1 0\n0 1",            expected: "impossible" },
      { input: "2\n1\n1 0",                 expected: "0 1" },
    ],
    hints: [
      "Build adjacency list: adj[b].append(a) for prerequisite [a,b].",
      "Compute in-degree for each node. Start BFS from nodes with in-degree 0.",
      "Each time you process a node, reduce in-degrees of its neighbours.",
      "If any neighbour's in-degree becomes 0, add to queue.",
      "Cycle detection: if len(result) < numCourses after BFS, a cycle exists.",
    ],
    solutions: {
      71: `from collections import deque,defaultdict
import sys
lines=sys.stdin.read().splitlines()
n=int(lines[0])
p=int(lines[1])
adj=defaultdict(list)
indeg=[0]*n
for i in range(p):
    a,b=map(int,lines[2+i].split())
    adj[b].append(a);indeg[a]+=1
q=deque(i for i in range(n) if indeg[i]==0)
res=[]
while q:
    u=q.popleft();res.append(u)
    for v in adj[u]:
        indeg[v]-=1
        if indeg[v]==0:q.append(v)
print(*res if len(res)==n else['impossible'])`,
    },
    boilerplate: {
      71: `from collections import deque, defaultdict
import sys
lines = sys.stdin.read().splitlines()
n = int(lines[0])
p = int(lines[1])
adj = defaultdict(list)
indegree = [0] * n
for i in range(p):
    a, b = map(int, lines[2 + i].split())
    adj[b].append(a)
    indegree[a] += 1
# Kahn's BFS topological sort
queue = deque(i for i in range(n) if indegree[i] == 0)
result = []
while queue:
    u = queue.popleft()
    result.append(u)
    for v in adj[u]:
        indegree[v] -= 1
        if indegree[v] == 0:
            queue.append(v)
if len(result) == n:
    print(*result)
else:
    print("impossible")`,
    },
    defaultStdin: "4\n4\n1 0\n2 0\n3 1\n3 2",
  },

  {
    id: 24, title: "Merge K Sorted Lists", difficulty: "Hard", category: "Linked Lists", solved: false,
    description: `## Problem

You are given \`k\` sorted linked lists. Merge them into one sorted linked list and return the result.

In the stdin version, you're given \`k\` sorted arrays (one per line). Merge them into a single sorted array.

## Approaches

### Approach 1 — Brute Force O(N log N)
Collect all values, sort, output. Easy but doesn't use the sorted property.

### Approach 2 — Min-Heap O(N log k)
Use a **min-heap** of size k. Initially push the first element of each list.
Repeatedly extract the minimum, output it, and push the next element from the same list.

This is the **optimal** approach — used in external sorting, database merge operations, and distributed systems.

### Approach 3 — Divide & Conquer O(N log k)
Recursively merge pairs of lists. Each level is O(N), with log k levels.

## Input Format

- Line 1: k (number of lists)
- Next k lines: space-separated sorted integers (each line is one list)

## Output Format

A single line of space-separated integers in sorted order.`,
    constraints: [
      "k == lists.length",
      "0 ≤ k ≤ 10⁴",
      "0 ≤ lists[i].length ≤ 500",
      "-10⁴ ≤ lists[i][j] ≤ 10⁴",
      "lists[i] is sorted in ascending order.",
      "The sum of lists[i].length will not exceed 10⁴.",
    ],
    examples: [
      {
        input: "3\n1 4 5\n1 3 4\n2 6",
        output: "1 1 2 3 4 4 5 6",
        explanation: "Three sorted lists merged: [1,4,5], [1,3,4], [2,6] → [1,1,2,3,4,4,5,6].",
      },
      {
        input: "0\n",
        output: "",
        explanation: "No lists — output is empty.",
      },
      {
        input: "1\n",
        output: "",
        explanation: "One empty list — output is empty.",
      },
      {
        input: "2\n-3 -1 0 5\n-4 -2 4 6",
        output: "-4 -3 -2 -1 0 4 5 6",
        explanation: "Two sorted lists merged in order.",
      },
    ],
    testCases: [
      { input: "3\n1 4 5\n1 3 4\n2 6",    expected: "1 1 2 3 4 4 5 6" },
      { input: "2\n-3 -1 0 5\n-4 -2 4 6", expected: "-4 -3 -2 -1 0 4 5 6" },
      { input: "1\n5 10 15",               expected: "5 10 15" },
    ],
    hints: [
      "Use heapq in Python: push (value, list_index, element_index) tuples.",
      "Initialise heap with first element of every non-empty list.",
      "Each heappop gives the global minimum — push the next element from the same list.",
      "Time: O(N log k) where N = total elements and k = number of lists.",
      "For divide & conquer: mergeKLists = mergeTwoLists(first half, second half) recursively.",
    ],
    solutions: {
      71: `import heapq,sys
lines=sys.stdin.read().splitlines()
k=int(lines[0])
lists=[list(map(int,lines[i+1].split()))for i in range(k)if lines[i+1].strip()]
heap=[]
for i,lst in enumerate(lists):
    if lst:heapq.heappush(heap,(lst[0],i,0))
res=[]
while heap:
    val,i,j=heapq.heappop(heap)
    res.append(val)
    if j+1<len(lists[i]):heapq.heappush(heap,(lists[i][j+1],i,j+1))
print(*res)`,
    },
    boilerplate: {
      71: `import heapq, sys
lines = sys.stdin.read().splitlines()
k = int(lines[0])
lists = [list(map(int, lines[i+1].split())) for i in range(k) if i+1 < len(lines) and lines[i+1].strip()]
heap = []
# Initialise heap with first element of each list
for i, lst in enumerate(lists):
    if lst:
        heapq.heappush(heap, (lst[0], i, 0))
result = []
while heap:
    val, i, j = heapq.heappop(heap)
    result.append(val)
    if j + 1 < len(lists[i]):
        heapq.heappush(heap, (lists[i][j+1], i, j+1))
print(*result)`,
    },
    defaultStdin: "3\n1 4 5\n1 3 4\n2 6",
  },

  {
    id: 25, title: "N-Queens", difficulty: "Hard", category: "Backtracking", solved: false,
    description: `## Problem

The **N-Queens** problem asks you to place \`n\` queens on an \`n × n\` chessboard such that no two queens attack each other.

A queen attacks along rows, columns, and both diagonals. Return the **number of distinct solutions**.

## Background

This is one of the most famous constraint satisfaction problems in computer science. It tests your ability to implement **backtracking with pruning**.

IBM's Deep Blue solved N-Queens as a benchmark. It appears in nearly every "backtracking" interview set at FAANG companies.

## Backtracking with 3 Constraint Sets

Track three sets to check attacks in O(1):
- \`cols\` — occupied columns
- \`diag1\` — occupied left diagonals (row - col is constant)
- \`diag2\` — occupied right diagonals (row + col is constant)

For each row, try each column. If not blocked, place queen, recurse to next row, then backtrack.

## Input Format

A single integer \`n\`.

## Output Format

A single integer — total number of distinct solutions.`,
    constraints: [
      "1 ≤ n ≤ 9",
    ],
    examples: [
      {
        input: "4",
        output: "2",
        explanation: "There are 2 distinct solutions for 4-Queens:\n. Q . .    . . Q .\n. . . Q    Q . . .\nQ . . .    . . . Q\n. . Q .    . Q . .",
      },
      {
        input: "1",
        output: "1",
        explanation: "Single queen on 1×1 board — trivially 1 solution.",
      },
      {
        input: "8",
        output: "92",
        explanation: "The classic 8-Queens problem has 92 distinct solutions.",
      },
      {
        input: "6",
        output: "4",
        explanation: "6×6 board has exactly 4 solutions.",
      },
    ],
    testCases: [
      { input: "4", expected: "2"  },
      { input: "1", expected: "1"  },
      { input: "8", expected: "92" },
    ],
    hints: [
      "Recurse row by row. In each row, try all columns.",
      "Use three O(1) sets: cols, diag1 (r-c), diag2 (r+c) to check conflicts.",
      "If (col not in cols) and (r-col not in diag1) and (r+col not in diag2) → safe to place.",
      "Add to all three sets, recurse to row+1, then remove (backtrack).",
      "Base case: row == n → increment solution counter.",
    ],
    solutions: {
      71: `n=int(input())
cols=set();d1=set();d2=set()
count=[0]
def bt(r):
    if r==n:count[0]+=1;return
    for c in range(n):
        if c in cols or r-c in d1 or r+c in d2:continue
        cols.add(c);d1.add(r-c);d2.add(r+c)
        bt(r+1)
        cols.remove(c);d1.remove(r-c);d2.remove(r+c)
bt(0)
print(count[0])`,
      54: `#include<bits/stdc++.h>
using namespace std;
int n,ans=0;
set<int>cols,d1,d2;
void bt(int r){
    if(r==n){ans++;return;}
    for(int c=0;c<n;c++){
        if(cols.count(c)||d1.count(r-c)||d2.count(r+c))continue;
        cols.insert(c);d1.insert(r-c);d2.insert(r+c);
        bt(r+1);
        cols.erase(c);d1.erase(r-c);d2.erase(r+c);
    }
}
int main(){cin>>n;bt(0);cout<<ans;}`,
    },
    boilerplate: {
      71: `n = int(input())
cols = set()
diag1 = set()  # r - c constant
diag2 = set()  # r + c constant
count = 0

def backtrack(row):
    global count
    if row == n:
        count += 1
        return
    for col in range(n):
        if col in cols or (row - col) in diag1 or (row + col) in diag2:
            continue
        # Place queen
        cols.add(col); diag1.add(row - col); diag2.add(row + col)
        backtrack(row + 1)
        # Remove queen (backtrack)
        cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)

backtrack(0)
print(count)`,
      54: `#include<bits/stdc++.h>
using namespace std;
int n, ans = 0;
// Use sets for cols, diag1 (r-c), diag2 (r+c)
void backtrack(int row, set<int>& cols, set<int>& d1, set<int>& d2){
    if(row == n){ ans++; return; }
    for(int c = 0; c < n; c++){
        // Check and place
    }
}
int main(){ cin >> n; set<int> cols, d1, d2; backtrack(0, cols, d1, d2); cout << ans; }`,
    },
    defaultStdin: "8",
  },
];

export const CATEGORIES = [...new Set(PROBLEMS.map(p => p.category))];
export const DIFFICULTIES = ["Easy", "Medium", "Hard"];
export default PROBLEMS;
