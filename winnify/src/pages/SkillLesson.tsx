import { useState, useEffect, type ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePlan } from '@/contexts/PlanContext';
import {
  Search, ChevronUp, ChevronDown, CheckCircle,
  ArrowLeft, ArrowRight, Info, Send, Clock,
  Layers, Timer, Wrench, ShieldCheck, Tag, AlertTriangle,
  ChevronRight, ChevronLeft, Target, ListChecks, Trophy, XCircle,
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────────── */
interface Lesson {
  title: string;
  status: 'completed' | 'not-started' | 'locked';
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

/* ── Reusable article building blocks ─────────────────────────── */
function ArticleH2({ children }: { children: ReactNode }) {
  return <h2 className="text-[1.65rem] font-bold font-[family-name:var(--font-heading)] tracking-tight text-foreground mt-10 mb-4">{children}</h2>;
}

function ArticleP({ children }: { children: ReactNode }) {
  return <p className="text-base leading-[1.8] text-foreground/90 mb-4">{children}</p>;
}

function ArticleUL({ children }: { children: ReactNode }) {
  return <ul className="space-y-3 mb-6 ml-1">{children}</ul>;
}

function ArticleLI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-base leading-[1.8] text-foreground/90">
      <span className="mt-[11px] h-1.5 w-1.5 rounded-full bg-foreground/40 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function NoteCallout({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-lg pt-5 mb-6 bg-emerald-50 dark:bg-emerald-950/30">
      <div className="bg-background absolute left-0 top-0 h-6 w-8 rounded-br-full" />
      <div className="absolute" style={{ left: -4, top: -10 }}>
        <div className="flex h-8 w-8 items-center justify-center rounded bg-transparent">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <div className="ml-1 flex items-start rounded-bl-lg border-0 border-l-4 border-solid border-emerald-600 dark:border-emerald-400 pl-5 pr-4 pb-4 text-base leading-[1.8]">
        <div className="text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-lg pt-5 mb-6 bg-blue-50 dark:bg-blue-950/30">
      <div className="bg-background absolute left-0 top-0 h-6 w-8 rounded-br-full" />
      <div className="absolute" style={{ left: -4, top: -10 }}>
        <div className="flex h-8 w-8 items-center justify-center rounded bg-transparent">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="ml-1 flex items-start rounded-bl-lg border-0 border-l-4 border-solid border-blue-600 dark:border-blue-400 pl-5 pr-4 pb-4 text-base leading-[1.8]">
        <div className="text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

/* ── Skill → Chapter mapping ──────────────────────────────────── */
const skillChapters: Record<string, Chapter[]> = {
  'arrays-two-pointers': [
    { id: 1, title: 'Introduction to Arrays', lessons: [
      { title: 'What are Arrays?', status: 'completed' },
      { title: 'Array Operations — Insert, Delete, Search', status: 'completed' },
      { title: 'Time & Space Complexity of Arrays', status: 'completed' },
    ]},
    { id: 2, title: 'Two Pointer Technique', lessons: [
      { title: 'Two Pointer Pattern Overview', status: 'completed' },
      { title: 'Pair Sum Problems', status: 'completed' },
      { title: 'Container With Most Water', status: 'completed' },
      { title: 'Three Sum Problem', status: 'completed' },
    ]},
    { id: 3, title: 'Practice Problems', lessons: [
      { title: 'Easy — Remove Duplicates', status: 'completed' },
      { title: 'Medium — Trapping Rain Water', status: 'not-started' },
      { title: 'Hard — Median of Two Sorted Arrays', status: 'locked' },
    ]},
  ],
  'linked-lists': [
    { id: 1, title: 'Singly Linked Lists', lessons: [
      { title: 'What is a Linked List?', status: 'completed' },
      { title: 'Insertion & Deletion', status: 'completed' },
      { title: 'Reversing a Linked List', status: 'completed' },
    ]},
    { id: 2, title: 'Doubly Linked Lists', lessons: [
      { title: 'Doubly Linked List Operations', status: 'completed' },
      { title: 'LRU Cache Implementation', status: 'not-started' },
    ]},
    { id: 3, title: 'Fast & Slow Pointers', lessons: [
      { title: 'Cycle Detection', status: 'not-started' },
      { title: 'Finding Middle Element', status: 'not-started' },
      { title: 'Palindrome Linked List', status: 'locked' },
    ]},
  ],
  'dbms-normalization': [
    { id: 1, title: 'Database Fundamentals', lessons: [
      { title: 'Why Every Developer Should Learn DBMS', status: 'not-started' },
      { title: 'Relational Model & Keys', status: 'not-started' },
      { title: 'Entity-Relationship Diagrams', status: 'not-started' },
    ]},
    { id: 2, title: 'Normalization', lessons: [
      { title: 'Functional Dependencies', status: 'not-started' },
      { title: 'Normal Forms (1NF to BCNF)', status: 'not-started' },
      { title: 'Denormalization Trade-offs', status: 'not-started' },
    ]},
    { id: 3, title: 'Transactions & Concurrency', lessons: [
      { title: 'ACID Properties', status: 'not-started' },
      { title: 'Isolation Levels', status: 'locked' },
      { title: 'Deadlock Detection', status: 'locked' },
    ]},
  ],
  'system-design-basics': [
    { id: 1, title: 'Introduction', lessons: [
      { title: 'Why Every Developer Should Learn System Design', status: 'not-started' },
      { title: 'Course Structure for Modern System Design', status: 'not-started' },
    ]},
    { id: 2, title: 'System Design Interviews', lessons: [
      { title: 'Getting Ready for the System Design Interview', status: 'not-started' },
      { title: "The Do's and Don'ts of the Interview", status: 'not-started' },
      { title: 'System Design Interview Trap', status: 'not-started' },
      { title: 'How Long Does It Take to Prepare?', status: 'not-started' },
      { title: 'System Design Mock Interviews', status: 'locked' },
    ]},
    { id: 3, title: 'Core Concepts', lessons: [
      { title: 'Load Balancing & Caching', status: 'locked' },
      { title: 'Database Sharding', status: 'locked' },
      { title: 'CAP Theorem', status: 'locked' },
    ]},
  ],
};

/* Default chapters for skills without specific content */
const defaultChapters: Chapter[] = [
  { id: 1, title: 'Fundamentals', lessons: [
    { title: 'Core Concepts & Terminology', status: 'not-started' },
    { title: 'Key Principles', status: 'not-started' },
    { title: 'Common Patterns', status: 'not-started' },
  ]},
  { id: 2, title: 'Implementation', lessons: [
    { title: 'Step-by-Step Walkthrough', status: 'not-started' },
    { title: 'Code Examples', status: 'not-started' },
    { title: 'Edge Cases', status: 'not-started' },
  ]},
  { id: 3, title: 'Practice', lessons: [
    { title: 'Easy Problems', status: 'not-started' },
    { title: 'Medium Problems', status: 'locked' },
    { title: 'Hard Problems', status: 'locked' },
  ]},
];

/* Skill slug → display name */
const skillNames: Record<string, string> = {
  'arrays-two-pointers': 'Arrays & Two Pointers',
  'strings-pattern-matching': 'Strings & Pattern Matching',
  'sliding-window': 'Sliding Window',
  'linked-lists': 'Linked Lists',
  'stacks-queues': 'Stacks & Queues',
  'binary-trees-bst': 'Binary Trees & BST',
  'tree-traversals': 'Tree Traversals & Construction',
  'heaps-priority-queues': 'Heaps & Priority Queues',
  'graph-representations': 'Graph Representations',
  'bfs-dfs': 'BFS & DFS',
  'shortest-path': 'Shortest Path Algorithms',
  'dp-1d': 'Dynamic Programming (1D)',
  'dp-2d': 'Dynamic Programming (2D)',
  'dbms-normalization': 'DBMS & Normalization',
  'sql-queries': 'SQL Queries & Joins',
  'os-process': 'OS Process Management',
  'memory-scheduling': 'Memory & Scheduling',
  'cn-tcp-ip': 'CN — TCP/IP & OSI',
  'oop-principles': 'OOP Principles',
  'system-design-basics': 'System Design Basics',
  'sorting-searching': 'Sorting & Searching',
  'greedy-algorithms': 'Greedy Algorithms',
  'revision-mock-test': 'Revision & Mock Test',
};

/* Skill metadata per slug */
const skillMeta: Record<string, { grouping: string; duration: string; toolsets: string; prerequisites: string; category: string; criticality: string }> = {
  'arrays-two-pointers': { grouping: 'Data Structures', duration: '~4h', toolsets: 'C++ / Java / Python', prerequisites: 'None', category: 'Technical', criticality: 'Mandatory' },
  'strings-pattern-matching': { grouping: 'Data Structures', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Arrays basics', category: 'Technical', criticality: 'Mandatory' },
  'sliding-window': { grouping: 'Algorithm Patterns', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Arrays & Strings', category: 'Technical', criticality: 'Mandatory' },
  'linked-lists': { grouping: 'Data Structures', duration: '~4h', toolsets: 'C++ / Java / Python', prerequisites: 'Pointers / References', category: 'Technical', criticality: 'Mandatory' },
  'stacks-queues': { grouping: 'Data Structures', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Arrays, Linked Lists', category: 'Technical', criticality: 'Mandatory' },
  'binary-trees-bst': { grouping: 'Tree Structures', duration: '~5h', toolsets: 'C++ / Java / Python', prerequisites: 'Recursion, Stacks', category: 'Technical', criticality: 'Mandatory' },
  'tree-traversals': { grouping: 'Tree Structures', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Binary Trees', category: 'Technical', criticality: 'Mandatory' },
  'heaps-priority-queues': { grouping: 'Tree Structures', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Arrays, Trees', category: 'Technical', criticality: 'Recommended' },
  'graph-representations': { grouping: 'Graph Algorithms', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Arrays, Linked Lists', category: 'Technical', criticality: 'Mandatory' },
  'bfs-dfs': { grouping: 'Graph Algorithms', duration: '~4h', toolsets: 'C++ / Java / Python', prerequisites: 'Graph Representations', category: 'Technical', criticality: 'Mandatory' },
  'shortest-path': { grouping: 'Graph Algorithms', duration: '~4h', toolsets: 'C++ / Java / Python', prerequisites: 'BFS & DFS, Heaps', category: 'Technical', criticality: 'Recommended' },
  'dp-1d': { grouping: 'Algorithm Patterns', duration: '~5h', toolsets: 'C++ / Java / Python', prerequisites: 'Recursion, Arrays', category: 'Technical', criticality: 'Mandatory' },
  'dp-2d': { grouping: 'Algorithm Patterns', duration: '~5h', toolsets: 'C++ / Java / Python', prerequisites: 'DP (1D)', category: 'Technical', criticality: 'Recommended' },
  'dbms-normalization': { grouping: 'Database Fundamentals', duration: '~4h', toolsets: 'MySQL / PostgreSQL', prerequisites: 'None', category: 'Technical', criticality: 'Mandatory' },
  'sql-queries': { grouping: 'Database Fundamentals', duration: '~3h', toolsets: 'MySQL / PostgreSQL', prerequisites: 'DBMS basics', category: 'Technical', criticality: 'Mandatory' },
  'os-process': { grouping: 'Operating Systems', duration: '~4h', toolsets: 'Linux / C', prerequisites: 'None', category: 'Technical', criticality: 'Mandatory' },
  'memory-scheduling': { grouping: 'Operating Systems', duration: '~3h', toolsets: 'Linux / C', prerequisites: 'OS Process Mgmt', category: 'Technical', criticality: 'Recommended' },
  'cn-tcp-ip': { grouping: 'Computer Networks', duration: '~3h', toolsets: 'Wireshark / Cisco Packet Tracer', prerequisites: 'None', category: 'Technical', criticality: 'Mandatory' },
  'oop-principles': { grouping: 'Programming Foundations', duration: '~3h', toolsets: 'Java / C++ / Python', prerequisites: 'None', category: 'Technical', criticality: 'Mandatory' },
  'system-design-basics': { grouping: 'Architecture & Design', duration: '~5h', toolsets: 'Excalidraw / Draw.io', prerequisites: 'DBMS, OS, CN basics', category: 'Technical', criticality: 'Recommended' },
  'sorting-searching': { grouping: 'Algorithm Patterns', duration: '~4h', toolsets: 'C++ / Java / Python', prerequisites: 'Arrays', category: 'Technical', criticality: 'Mandatory' },
  'greedy-algorithms': { grouping: 'Algorithm Patterns', duration: '~3h', toolsets: 'C++ / Java / Python', prerequisites: 'Sorting, Arrays', category: 'Technical', criticality: 'Recommended' },
  'revision-mock-test': { grouping: 'Assessment & Review', duration: '~6h', toolsets: 'Winnify Platform', prerequisites: 'All previous topics', category: 'Assessment', criticality: 'Mandatory' },
};

/* ── Rich article content per lesson ──────────────────────────── */
function getLessonArticle(lessonTitle: string, skillName: string): ReactNode {
  const articles: Record<string, ReactNode> = {
    'What are Arrays?': (
      <>
        <div className="mb-6">
          <p className="text-lg leading-[1.8] text-foreground/80">
            Understand why arrays are the most fundamental data structure in computer science. Learn how contiguous memory allocation enables constant-time access and why arrays form the foundation for nearly every other data structure you will encounter.
          </p>
        </div>

        <ArticleP>
          Arrays are the simplest and most widely used data structure. They store elements of the same type in a contiguous block of memory, which means each element can be accessed directly using its index. This property — called <strong>random access</strong> — is what makes arrays so powerful and efficient for many operations.
        </ArticleP>

        <NoteCallout>
          <p><strong>Note:</strong> In interviews, always clarify three things before writing code: Is the array sorted? Are there duplicates? What are the constraints on size? These details determine which approach is optimal.</p>
        </NoteCallout>

        <ArticleH2>Why arrays matter</ArticleH2>

        <ArticleP>
          Nearly every data structure you will study builds on arrays in some way. Hash tables use arrays internally. Heaps are implemented as arrays. Matrices are two-dimensional arrays. Understanding how arrays work at the memory level gives you intuition for performance characteristics across all these structures.
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Contiguous memory:</strong> Elements are stored next to each other in memory, enabling O(1) access by index through simple pointer arithmetic.</ArticleLI>
          <ArticleLI><strong>Static vs. dynamic:</strong> Static arrays have a fixed size determined at creation. Dynamic arrays (like ArrayList in Java or vector in C++) resize automatically by allocating a larger block and copying elements.</ArticleLI>
          <ArticleLI><strong>Cache performance:</strong> Because elements are adjacent in memory, arrays benefit from CPU cache locality — iterating through an array is significantly faster than traversing a linked list.</ArticleLI>
          <ArticleLI><strong>Trade-offs:</strong> Insertion and deletion in the middle require shifting elements, making these operations O(n). This is the key limitation that motivates linked lists and trees.</ArticleLI>
        </ArticleUL>

        <ArticleH2>Common operations and their complexity</ArticleH2>

        <ArticleP>
          Understanding the time complexity of basic array operations is essential for making informed decisions about which data structure to use:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Access by index:</strong> O(1) — the defining advantage of arrays.</ArticleLI>
          <ArticleLI><strong>Search (unsorted):</strong> O(n) — must check each element sequentially.</ArticleLI>
          <ArticleLI><strong>Search (sorted):</strong> O(log n) — binary search cuts the search space in half each step.</ArticleLI>
          <ArticleLI><strong>Insert at end:</strong> O(1) amortized for dynamic arrays, O(n) worst case when resizing occurs.</ArticleLI>
          <ArticleLI><strong>Insert at position:</strong> O(n) — elements after the insertion point must shift right.</ArticleLI>
          <ArticleLI><strong>Delete at position:</strong> O(n) — elements after the deletion point must shift left.</ArticleLI>
        </ArticleUL>

        <InfoCallout>
          <p><strong>Note:</strong> When choosing between arrays and other structures, consider your access pattern. If you need frequent random access and rare insertions, arrays are ideal. If you need frequent insertions and deletions, consider linked lists or balanced trees.</p>
        </InfoCallout>

        <ArticleH2>Arrays as building blocks</ArticleH2>

        <ArticleP>
          Arrays serve as the foundation for many advanced data structures and algorithms. Recognizing this connection helps you understand why array mastery is non-negotiable:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Hash tables:</strong> Use arrays of buckets to store key-value pairs with O(1) average lookup.</ArticleLI>
          <ArticleLI><strong>Heaps:</strong> Implemented as arrays where parent-child relationships are defined by index arithmetic.</ArticleLI>
          <ArticleLI><strong>Stacks and queues:</strong> Can be implemented efficiently using arrays with pointer tracking.</ArticleLI>
          <ArticleLI><strong>Sorting algorithms:</strong> Most sorting algorithms operate directly on arrays — understanding array behavior is prerequisite to understanding sorting.</ArticleLI>
        </ArticleUL>

        <ArticleP>
          Mastering arrays gives you the vocabulary and mental models needed to reason about more complex structures. Every topic that follows in this course builds on the concepts covered here.
        </ArticleP>
      </>
    ),

    'Two Pointer Pattern Overview': (
      <>
        <div className="mb-6">
          <p className="text-lg leading-[1.8] text-foreground/80">
            Discover how the two pointer technique transforms brute-force O(n²) solutions into elegant O(n) algorithms. Learn the two main variants — opposite direction and same direction — and understand when to apply each one.
          </p>
        </div>

        <ArticleP>
          The two pointer technique is one of the most frequently tested patterns in coding interviews. It uses two indices that traverse the data structure simultaneously, making decisions based on the values at both positions. This simple idea eliminates the need for nested loops in many problems.
        </ArticleP>

        <NoteCallout>
          <p><strong>Note:</strong> The two pointer technique is one of the most frequently tested patterns in coding interviews. Master it early — it appears in problems involving arrays, strings, and linked lists.</p>
        </NoteCallout>

        <ArticleH2>Opposite direction pointers</ArticleH2>

        <ArticleP>
          In this variant, one pointer starts at the beginning and the other at the end. They move toward each other based on a condition. This works best on sorted arrays where you can make guarantees about the relationship between pointer positions and target values.
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Pair sum on sorted array:</strong> If the sum is too small, move the left pointer right. If too large, move the right pointer left. This guarantees you find the pair in O(n).</ArticleLI>
          <ArticleLI><strong>Container With Most Water:</strong> Start with the widest container and move the shorter side inward — you can prove this never skips the optimal solution.</ArticleLI>
          <ArticleLI><strong>Palindrome checking:</strong> Compare characters from both ends moving inward. If they ever differ, the string is not a palindrome.</ArticleLI>
        </ArticleUL>

        <ArticleH2>Same direction pointers</ArticleH2>

        <ArticleP>
          Here both pointers start at the same end and move in the same direction, but at different speeds or under different conditions. This variant is also called the fast/slow pointer technique.
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Remove duplicates in-place:</strong> A slow pointer tracks the write position while a fast pointer scans ahead for unique elements.</ArticleLI>
          <ArticleLI><strong>Linked list cycle detection:</strong> A fast pointer moves two steps while a slow pointer moves one. If they meet, there is a cycle.</ArticleLI>
          <ArticleLI><strong>Partitioning:</strong> Used in quicksort and the Dutch National Flag problem to partition elements around a pivot.</ArticleLI>
        </ArticleUL>

        <InfoCallout>
          <p><strong>Note:</strong> When deciding between two pointers and a hash map, consider the constraints. Two pointers require sorted input (or can work with it) and use O(1) space. Hash maps work on unsorted input but use O(n) space. Interviewers often ask for both approaches.</p>
        </InfoCallout>

        <ArticleH2>When to recognize the pattern</ArticleH2>

        <ArticleP>
          Look for these signals that suggest a two pointer approach:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Sorted input:</strong> Problems on sorted arrays or strings often benefit from opposite-direction pointers.</ArticleLI>
          <ArticleLI><strong>In-place modification:</strong> When you need to modify an array without extra space, same-direction pointers are a natural fit.</ArticleLI>
          <ArticleLI><strong>Pair or triplet finding:</strong> Any problem asking you to find elements that satisfy a condition together is a candidate.</ArticleLI>
          <ArticleLI><strong>Subarray or substring:</strong> Combined with the sliding window technique, two pointers handle variable-length window problems efficiently.</ArticleLI>
        </ArticleUL>

        <ArticleP>
          The two pointer technique is deceptively simple but remarkably versatile. Once you internalize the pattern, you will start recognizing it in problems that initially seem to require brute force.
        </ArticleP>
      </>
    ),

    'Why Every Developer Should Learn DBMS': (
      <>
        <div className="mb-6">
          <p className="text-lg leading-[1.8] text-foreground/80">
            Discover why database management systems are indispensable for building reliable, scalable applications. Understand how DBMS knowledge elevates your ability to design data models, write efficient queries, and make informed architectural decisions.
          </p>
        </div>

        <ArticleP>
          Modern applications are fundamentally data-driven. Whether you are building a mobile app, a web platform, or a distributed microservice, your code interacts with a database at almost every step. Understanding how databases work — not just how to query them — is what separates developers who build features from developers who build systems.
        </ArticleP>

        <NoteCallout>
          <p><strong>Note:</strong> DBMS knowledge bridges the gap between writing queries and engineering data systems. It provides the tools to manage complexity, optimize performance, and ensure data integrity under real-world conditions.</p>
        </NoteCallout>

        <ArticleH2>Why do we need DBMS?</ArticleH2>

        <ArticleP>
          Software development has evolved from simple file-based storage to complex, distributed data ecosystems. What was once handled by a single database server now spans multiple regions, replication strategies, and consistency models.
        </ArticleP>

        <ArticleP>
          Mastering DBMS enables developers to reason about data modeling, anticipate query bottlenecks, and design schemas that meet core objectives like consistency, availability, and performance.
        </ArticleP>

        <ArticleH2>Why every developer should learn DBMS</ArticleH2>

        <ArticleP>
          Most developers interact with databases daily, either directly through SQL or through ORMs and managed services. DBMS knowledge helps you work with data more effectively across roles:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Backend developers:</strong> Design schemas, write efficient queries, manage indexes, and handle transactions. DBMS knowledge is critical for balancing read vs. write performance.</ArticleLI>
          <ArticleLI><strong>Frontend developers:</strong> Consume APIs backed by databases. Understanding data modeling helps optimize data fetching and handle edge cases gracefully.</ArticleLI>
          <ArticleLI><strong>Data engineers:</strong> Build ETL pipelines and analytics platforms. DBMS fundamentals ensure data remains consistent and queryable at scale.</ArticleLI>
          <ArticleLI><strong>DevOps engineers:</strong> Manage database deployments, backups, and replication. Understanding internals helps troubleshoot performance issues in production.</ArticleLI>
          <ArticleLI><strong>Mobile developers:</strong> Work with local databases like SQLite and sync with remote servers. DBMS concepts help handle offline-first architectures.</ArticleLI>
        </ArticleUL>

        <ArticleP>
          Ultimately, DBMS knowledge strengthens collaboration by giving everyone a shared understanding of how data flows through the system end-to-end.
        </ArticleP>

        <ArticleH2>What DBMS covers in day-to-day engineering</ArticleH2>

        <ArticleP>
          DBMS connects everyday engineering tasks to broader data architecture principles. Practical day-to-day work includes:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Schema design:</strong> Defining tables, relationships, and constraints that enforce data integrity at the database level.</ArticleLI>
          <ArticleLI><strong>Query optimization:</strong> Analyzing execution plans, adding indexes, and restructuring queries to reduce latency.</ArticleLI>
          <ArticleLI><strong>Transaction management:</strong> Ensuring ACID properties are maintained across concurrent operations.</ArticleLI>
          <ArticleLI><strong>Migration planning:</strong> Evolving schemas safely without downtime or data loss.</ArticleLI>
          <ArticleLI><strong>Capacity planning:</strong> Evaluating storage growth, query patterns, and connection pool sizing.</ArticleLI>
        </ArticleUL>

        <InfoCallout>
          <p><strong>Note:</strong> A solid understanding of normalization, indexing, and transaction isolation levels will help you avoid the most common performance pitfalls in production databases. These topics are also heavily tested in technical interviews.</p>
        </InfoCallout>

        <ArticleH2>Career benefits of learning DBMS</ArticleH2>

        <ArticleP>
          Learning DBMS early improves your technical decision-making and helps you grow into higher-scope roles:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Accelerated learning:</strong> Grasping data modeling principles builds intuition for solving complex backend problems.</ArticleLI>
          <ArticleLI><strong>Informed decision-making:</strong> You can evaluate trade-offs between SQL and NoSQL, normalized and denormalized schemas, and consistency vs. availability.</ArticleLI>
          <ArticleLI><strong>Improved collaboration:</strong> Creates a shared vocabulary with DBAs, data engineers, and backend teams.</ArticleLI>
          <ArticleLI><strong>Career progression:</strong> Proficiency in DBMS is a prerequisite for senior engineering and system design roles.</ArticleLI>
        </ArticleUL>

        <ArticleP>
          Early engagement with DBMS concepts strengthens problem-solving skills and equips developers to contribute effectively to data-intensive projects. The lessons that follow will cover normalization, indexing, and transaction management in detail.
        </ArticleP>
      </>
    ),

    'Why Every Developer Should Learn System Design': (
      <>
        <div className="mb-6">
          <p className="text-lg leading-[1.8] text-foreground/80">
            Discover why System Design is indispensable for building reliable, scalable, and maintainable software in a distributed environment. Understand how this core skill elevates technical judgment, improves cross-team collaboration, and accelerates career growth into senior engineering roles.
          </p>
        </div>

        <ArticleP>
          Modern software runs on distributed systems, interconnected services, and strict expectations around latency and availability. Understanding these systems is critical if you want to build applications that remain reliable under load. This lesson explains why system design matters for developers and why learning it early will make you more effective.
        </ArticleP>

        <ArticleH2>Why do we need System Design?</ArticleH2>

        <ArticleP>
          Software development has evolved from standalone applications to complex, distributed ecosystems. What was once the domain of large tech companies is now the baseline for modern systems.
        </ArticleP>

        <NoteCallout>
          <p><strong>Note:</strong> System Design bridges the gap between writing features and engineering systems. It provides the tools to manage complexity, make informed trade-offs, and ensure applications remain resilient under real-world demands.</p>
        </NoteCallout>

        <ArticleP>
          Mastering System Design enables developers to reason about architecture, anticipate bottlenecks, and design systems that meet core objectives like performance and availability.
        </ArticleP>

        <ArticleH2>Why every developer should learn System Design</ArticleH2>

        <ArticleP>
          Most developers interact with distributed systems, either directly or through APIs and managed cloud services. System design helps you build and integrate these components more effectively across roles:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Mobile developers:</strong> Connect to services for authentication, payment, messaging, and storage. System Design helps handle network latency and build fault-tolerant apps.</ArticleLI>
          <ArticleLI><strong>Backend developers:</strong> Manage concurrency, caching, and scaling. System Design is critical for balancing trade-offs like latency vs. consistency.</ArticleLI>
          <ArticleLI><strong>Game developers:</strong> Build real-time multiplayer systems. Understanding replication and state synchronization is essential for low-latency experiences.</ArticleLI>
          <ArticleLI><strong>Frontend developers:</strong> Consume distributed APIs. Design knowledge helps optimize data fetching and handle backend errors gracefully.</ArticleLI>
          <ArticleLI><strong>Data engineers:</strong> Manage pipelines and streaming systems. System Design ensures platforms remain reliable under skewed workloads.</ArticleLI>
        </ArticleUL>

        <ArticleP>
          Ultimately, System Design strengthens collaboration by giving everyone a shared understanding of how the system functions end-to-end.
        </ArticleP>

        <ArticleH2>Why System Design matters in real-world systems</ArticleH2>

        <ArticleP>
          Real applications rely on distributed components that require careful coordination. Consider these practical scenarios where System Design is essential:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Ride share applications:</strong> Integrate messaging, payments, and location tracking. Developers must use load balancers and caching to handle high traffic while maintaining responsiveness.</ArticleLI>
          <ArticleLI><strong>Cloud-based gaming:</strong> Supports thousands of concurrent users. This demands thoughtful design of real-time communication and data replication to minimize latency.</ArticleLI>
          <ArticleLI><strong>Search engines:</strong> Coordinate indexing, ranking, and ad delivery. Strong design principles allow developers to optimize performance and manage distributed data.</ArticleLI>
          <ArticleLI><strong>Dynamic web applications:</strong> Depend on multiple backends and databases. Understanding data flow ensures user interactions are processed securely and efficiently.</ArticleLI>
        </ArticleUL>

        <NoteCallout>
          <p><strong>Note:</strong> Real-world systems underscore the importance of System Design. Applying core design principles ensures software remains scalable and maintainable even under complex conditions.</p>
        </NoteCallout>

        <ArticleH2>Career benefits of learning System Design</ArticleH2>

        <ArticleP>
          Learning System Design early improves your technical decision-making and helps you grow into higher-scope roles:
        </ArticleP>

        <ArticleUL>
          <ArticleLI><strong>Accelerated learning:</strong> Grasping system-level principles builds intuition for solving complex problems.</ArticleLI>
          <ArticleLI><strong>Informed decision-making:</strong> Developers can evaluate trade-offs and anticipate issues such as latency, throughput, and failure modes before deployment.</ArticleLI>
          <ArticleLI><strong>Improved collaboration:</strong> Creates a shared understanding of architecture, facilitating better communication with teams and leadership.</ArticleLI>
          <ArticleLI><strong>Career progression:</strong> Proficiency in System Design is a prerequisite for senior engineering and leadership roles.</ArticleLI>
        </ArticleUL>

        <InfoCallout>
          <p><strong>Note:</strong> A checklist that covers requirements, data modeling, and failure scenarios helps teams build systems that are reliable and operable. Getting into the habit of thinking through edge cases and failure modes reduces operational risk.</p>
        </InfoCallout>

        <ArticleH2>Conclusion</ArticleH2>

        <ArticleP>
          System design gives developers the context they need to work effectively on modern software systems. It improves how you make tradeoffs and helps you build systems that scale without falling over in production. This lesson sets up the rest of the course, where we will cover specific design techniques and real-world examples in detail.
        </ArticleP>
      </>
    ),
  };

  // ── DBMS custom content ──────────────────────────────────────
  articles['Database Management System'] = (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">SQL Foundations: Databases, RDBMS, SQL vs MySQL, and Table-Based Data Modeling</p>
      </div>
      <ArticleH2>Databases: the data you store</ArticleH2>
      <ArticleUL>
        <ArticleLI>Data is a collection of facts related to any object (e.g., your name, number, birthday, phone number, email address).</ArticleLI>
        <ArticleLI>A database is a systematic collection of small units of information (data).</ArticleLI>
        <ArticleLI>Example: an organized list of all the students of a school along with their data (Name, Phone Number, Birthday, etc.) is referred to as a database.</ArticleLI>
      </ArticleUL>
      <ArticleH2>RDBMS: the system that manages relational data</ArticleH2>
      <ArticleUL>
        <ArticleLI>RDBMS (Relational Database Management System) stands for Relational DataBase Management System.</ArticleLI>
        <ArticleLI>An RDBMS is &ldquo;a collection of tools that allow users to organize, manipulate, and visualize databases.&rdquo;</ArticleLI>
        <ArticleLI>RDBMS follows standards that allow for the fastest response from a database and make it easier for humans to interact with a database.</ArticleLI>
      </ArticleUL>
      <ArticleH2>SQL: the language to query and manage data</ArticleH2>
      <ArticleUL>
        <ArticleLI>SQL (Structured Query Language) is a structured language used to query the database for performing tasks such as storing, manipulating, and retrieving data.</ArticleLI>
        <ArticleLI>SQL is the standard language for communicating with powerful relational databases such as Oracle, Sybase, Microsoft SQL Server, Access, Ingres, etc.</ArticleLI>
        <ArticleLI>In relational databases, tasks like creating tables, limiting access to data, sorting, filtering, grouping, etc. are achieved using SQL.</ArticleLI>
      </ArticleUL>
      <ArticleH2>SQL vs MySQL</ArticleH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-4 py-2 text-left font-semibold">Aspect</th><th className="px-4 py-2 text-left font-semibold">SQL</th><th className="px-4 py-2 text-left font-semibold">MySQL</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-4 py-2">What it is</td><td className="px-4 py-2">A language/protocol used by RDBMS</td><td className="px-4 py-2">An RDBMS (database management system)</td></tr>
            <tr className="border-t border-border"><td className="px-4 py-2">Role</td><td className="px-4 py-2">Communicates with the database</td><td className="px-4 py-2">Provides an interface to connect with databases</td></tr>
            <tr className="border-t border-border"><td className="px-4 py-2">What you can do</td><td className="px-4 py-2">Perform powerful operations (managing data)</td><td className="px-4 py-2">Create databases, tables, stored procedures, functions</td></tr>
          </tbody>
        </table>
      </div>
      <ArticleH2>What SQL can do (core operations)</ArticleH2>
      <ArticleUL>
        <ArticleLI>Create / Delete Databases</ArticleLI>
        <ArticleLI>Create / Delete Table(s) in a database</ArticleLI>
        <ArticleLI>SELECT particular data from table(s)</ArticleLI>
        <ArticleLI>INSERT data into tables</ArticleLI>
        <ArticleLI>UPDATE data in tables</ArticleLI>
        <ArticleLI>DELETE data from tables</ArticleLI>
        <ArticleLI>Create Views in the database</ArticleLI>
        <ArticleLI>Execute various aggregate functions</ArticleLI>
      </ArticleUL>
      <ArticleH2>Getting started with SQL</ArticleH2>
      <ArticleP>To write SQL on your computer, you need to install a Database Management Server. After installing an RDBMS, you get tools to interact with your database and access to a Query Editor to type SQL queries.</ArticleP>
      <ArticleP>Common RDBMS: MySQL, Oracle, Microsoft SQL Server, PostgreSQL, Heidi SQL.</ArticleP>
      <ArticleH2>Table-based data modeling</ArticleH2>
      <ArticleP>To work with SQL, data is organized into tables. One database typically contains all the data for a single application and includes multiple tables.</ArticleP>
      <ArticleP>Example database for a restaurant management system includes tables such as: Customers, Orders, Menu Items, Receipts. Each table contains a specific type of data, and different tables can have different relations.</ArticleP>
    </>
  );

  articles['Database Management System — Implementation'] = (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">Working with Tables and Data Types: Creating Tables, CRUD Basics, and SQL Data Types</p>
      </div>
      <ArticleH2>Creating a table: fields + data types</ArticleH2>
      <ArticleP>To create a table, you need: all the fields you want to store, and the data type for each field.</ArticleP>
      <ArticleP>Example: a Customers table — <code>name</code> → varchar, <code>phone</code> → varchar, <code>postalCode</code> → integer. Add an ID column to uniquely identify each customer.</ArticleP>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`CREATE TABLE customers(
  ID INT NOT NULL,
  name varchar(50),
  phone varchar(15),
  postalCode INT
);

DROP TABLE customers;`}</pre>
      </div>
      <ArticleH2>CRUD basics (Create, Read, Update, Delete)</ArticleH2>
      <ArticleP>CRUD stands for Create, Read, Update, and Delete — the fundamental operations on any database.</ArticleP>
      <ArticleH2>INSERT (Create)</ArticleH2>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`INSERT INTO customers(ID, name, phone, postalCode)
VALUES(1, 'Alice', '+123456789', 123456);`}</pre>
      </div>
      <ArticleH2>SELECT (Read)</ArticleH2>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`SELECT name, phone FROM customers;
SELECT * FROM customers;`}</pre>
      </div>
      <ArticleH2>UPDATE</ArticleH2>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`UPDATE customers SET phone='+2223334445' WHERE ID=2;`}</pre>
      </div>
      <ArticleH2>DELETE</ArticleH2>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`DELETE FROM customers WHERE postalCode=223344;`}</pre>
      </div>
      <ArticleH2>SQL Data Types</ArticleH2>
      <ArticleP>Correct data types make it easier to manipulate data effectively.</ArticleP>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-3 py-2 text-left font-semibold">Type</th><th className="px-3 py-2 text-left font-semibold">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">CHAR(size)</td><td className="px-3 py-2">Fixed-length string, 0–255</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">VARCHAR(size)</td><td className="px-3 py-2">Variable-length string, 0–65535</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">INT(size)</td><td className="px-3 py-2">Signed range -2B to 2B; unsigned 0 to 4B</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">FLOAT(p)</td><td className="px-3 py-2">Floating-point; p 0–24 → FLOAT, 25–53 → DOUBLE</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">DECIMAL(size,d)</td><td className="px-3 py-2">Exact fixed-point number</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">DATE</td><td className="px-3 py-2">YYYY-MM-DD format</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">DATETIME(fsp)</td><td className="px-3 py-2">YYYY-MM-DD hh:mm:ss</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">TIMESTAMP(fsp)</td><td className="px-3 py-2">Unix timestamp since 1970-01-01</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">BOOL</td><td className="px-3 py-2">Zero = FALSE, non-zero = TRUE</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">TEXT(size)</td><td className="px-3 py-2">Max 65,536 bytes</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">BLOB(size)</td><td className="px-3 py-2">Binary large object, up to 65,536 bytes</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-mono">ENUM(vals)</td><td className="px-3 py-2">One value from a list (up to 65,535)</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );

  articles['Database Management System — Practice & Applications'] = (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">SQL Syntax Toolkit: Keywords, Operators, Logical Conditions, Keys, Joins, and Query Cheatsheets</p>
      </div>
      <ArticleH2>SQL Logical Operators</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>ALL</strong> — TRUE if all subquery values meet the condition</ArticleLI>
        <ArticleLI><strong>AND</strong> — TRUE if all conditions separated by AND are TRUE</ArticleLI>
        <ArticleLI><strong>ANY</strong> — TRUE if any subquery value meets the condition</ArticleLI>
        <ArticleLI><strong>BETWEEN</strong> — TRUE if operand is within the range</ArticleLI>
        <ArticleLI><strong>EXISTS</strong> — TRUE if subquery returns one or more records</ArticleLI>
        <ArticleLI><strong>IN</strong> — TRUE if operand equals one of a list</ArticleLI>
        <ArticleLI><strong>LIKE</strong> — TRUE if operand matches a pattern</ArticleLI>
        <ArticleLI><strong>NOT</strong> — Displays a record if condition is NOT TRUE</ArticleLI>
        <ArticleLI><strong>OR</strong> — TRUE if any condition separated by OR is TRUE</ArticleLI>
      </ArticleUL>
      <ArticleH2>Primary Key</ArticleH2>
      <ArticleUL>
        <ArticleLI>Uniquely identifies a single row in a table.</ArticleLI>
        <ArticleLI>There can only be one Primary Key per table.</ArticleLI>
        <ArticleLI>Primary Key must be unique for each row and cannot have NULL values.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Foreign Key</ArticleH2>
      <ArticleUL>
        <ArticleLI>A field in a table that references the PRIMARY KEY of another table.</ArticleLI>
        <ArticleLI>The table with the foreign key is the child table; the referenced table is the parent table.</ArticleLI>
      </ArticleUL>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`FOREIGN KEY(user_id) REFERENCES users(id)
FOREIGN KEY(product_id) REFERENCES products(id)`}</pre>
      </div>
      <ArticleH2>SQL Joins</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>INNER JOIN</strong> — Returns records with matching values in both tables.</ArticleLI>
        <ArticleLI><strong>LEFT JOIN</strong> — Returns all records from the first table + matching from second.</ArticleLI>
        <ArticleLI><strong>RIGHT JOIN</strong> — Returns all records from the second table + matching from first.</ArticleLI>
        <ArticleLI><strong>FULL JOIN</strong> — Returns all records from both tables when there is a match.</ArticleLI>
      </ArticleUL>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`SELECT orders.order_id, products.product_name,
       customers.customer_name, products.price
FROM orders
INNER JOIN products ON products.product_id = orders.product_id
INNER JOIN customers ON customers.customer_id = orders.customer_id;`}</pre>
      </div>
      <ArticleH2>SELECT Query Cheatsheet</ArticleH2>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`-- Specific columns
SELECT userId, name, age FROM Users;

-- All columns
SELECT * FROM Users;

-- Filtered
SELECT * FROM Users WHERE age > 18;

-- Distinct
SELECT DISTINCT country FROM Users;

-- Count
SELECT COUNT(*) FROM Users WHERE age > 18;

-- Sort
SELECT * FROM Users ORDER BY userId ASC;

-- Limit
SELECT * FROM Users WHERE country='india' LIMIT 20;

-- Aggregate
SELECT AVG(age) FROM Users;

-- Join with alias
SELECT us.userId, us.name, wall.balance
FROM Users AS us
INNER JOIN Wallets AS wall
ON us.walletId = wall.walletId;`}</pre>
      </div>
      <ArticleH2>INSERT / UPDATE / DELETE Cheatsheet</ArticleH2>
      <div className="rounded-lg bg-muted/50 p-4 mb-6 font-mono text-sm overflow-x-auto">
        <pre>{`-- Insert
INSERT INTO Users VALUES('Kanak', 'sales@kanak.com', 9876543210);
INSERT INTO Users(userName, email) VALUES('Kanak', 'sales@kanak.com');
INSERT INTO Users(userName) VALUES ('user1'), ('user2');

-- Update
UPDATE Users SET country='india';
UPDATE Users SET isEligible='true' WHERE age >= 18;

-- Delete
DELETE FROM Users;
DELETE FROM Users WHERE age < 18;`}</pre>
      </div>
    </>
  );

  // Return specific article or generate a contextual default
  // ── SDLC & Agile custom content ──────────────────────────────
  articles['SDLC & Agile Practices'] = (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">Overview of Agile SDLC, key concepts, and Agile Manifesto foundations</p>
      </div>
      <ArticleH2>Agile SDLC: core idea and terminology</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Agile SDLC Model</strong> — a combination of iterative and incremental process models with focus on process adaptability and customer satisfaction by rapid delivery of working software.</ArticleLI>
        <ArticleLI><strong>Agile Manifesto</strong> — foundation of most Agile methods, with 4 core values supplemented by 12 Principles. Developed in 2001 by 17 pioneer software engineers.</ArticleLI>
        <ArticleLI><strong>Agile Methods</strong> — methodologies for developing software based on the Agile SDLC model: Extreme Programming, SCRUM, KANBAN, DSDM, FDD, Crystal Family, etc.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Traditional vs Agile development</ArticleH2>
      <ArticleUL>
        <ArticleLI>Traditional SDLC models (e.g., Waterfall, V-Model) are rigid and heavyweight — they follow a sequence of pre-determined stages.</ArticleLI>
        <ArticleLI>They require a stable and fully known set of requirements at the very beginning and rely on detailed documentation.</ArticleLI>
        <ArticleLI>Handling changes during the lifecycle can be difficult; success relies on knowing all requirements before design begins.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Phases and workflow in Agile SDLC</ArticleH2>
      <ArticleUL>
        <ArticleLI>Agile life-cycle phases are repeatedly executed and continuously revisited.</ArticleLI>
        <ArticleLI>The life-cycle is divided into small parts called <strong>increments</strong> or <strong>iterations</strong>.</ArticleLI>
        <ArticleLI>Iterations are applied to conventional tasks (requirements, design, programming, testing). Each iteration incrementally evolves the product by delivering additional user stories as software features.</ArticleLI>
        <ArticleLI>A series of iterations produces a <strong>software release</strong> — a system version that can be successfully deployed.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Key characteristics of Agile SD</ArticleH2>
      <ArticleUL>
        <ArticleLI>Emphasis on code rather than design</ArticleLI>
        <ArticleLI>Iterative approach to software development</ArticleLI>
        <ArticleLI>Target to deliver working software quickly</ArticleLI>
        <ArticleLI>Evolve quickly to meet changing requirements</ArticleLI>
        <ArticleLI>Active customer involvement</ArticleLI>
        <ArticleLI>People-based rather than plan-based development</ArticleLI>
      </ArticleUL>
      <ArticleH2>Agile Manifesto: 4 core values</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Individuals and interactions</strong> over processes and tools</ArticleLI>
        <ArticleLI><strong>Working software</strong> over comprehensive documentation</ArticleLI>
        <ArticleLI><strong>Customer collaboration</strong> over contract negotiation</ArticleLI>
        <ArticleLI><strong>Responding to change</strong> over following a plan</ArticleLI>
      </ArticleUL>
      <ArticleP>While there is value in the items on the right, items on the left are valued more.</ArticleP>
      <ArticleH2>First Agile Principles</ArticleH2>
      <ArticleUL>
        <ArticleLI>Satisfy the customer through early and continuous delivery of valuable software.</ArticleLI>
        <ArticleLI>Welcome changing requirements, even late in development.</ArticleLI>
        <ArticleLI>Deliver working software frequently, with a preference to the shorter timescale.</ArticleLI>
        <ArticleLI>Business people and developers must work together daily throughout the project.</ArticleLI>
      </ArticleUL>
    </>
  );

  articles['SDLC & Agile Practices — Implementation'] = (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">Agile development lifecycle mechanics and core practices: iterative/incremental, planning, time-boxing, user involvement, team structure</p>
      </div>
      <ArticleH2>Core Agile mechanics and guiding principles</ArticleH2>
      <ArticleUL>
        <ArticleLI>Working software is the primary measure of progress.</ArticleLI>
        <ArticleLI>Agile processes promote sustainable development — sponsors, developers, and users should maintain a constant pace indefinitely.</ArticleLI>
        <ArticleLI>Continuous attention to technical excellence and good design enhances agility.</ArticleLI>
        <ArticleLI>Simplicity is essential: &ldquo;the art of maximizing the amount of work not done.&rdquo;</ArticleLI>
        <ArticleLI>Self-organizing teams produce the best architectures, requirements, and designs.</ArticleLI>
        <ArticleLI>At regular intervals, the team reflects on how to become more effective, then tunes and adjusts its behavior.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Human-centric and lightweight approach</ArticleH2>
      <ArticleUL>
        <ArticleLI>Build projects around motivated individuals: give them the environment and support they need, and trust them.</ArticleLI>
        <ArticleLI>The most efficient information transfer method is face-to-face conversation.</ArticleLI>
        <ArticleLI>Continuous user involvement and evolutionary development with focus on customer value/satisfaction.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Adaptive planning: three levels</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Release Planning</strong> (monthly) — overall project scope and external communication. Features planned by customers and product owner.</ArticleLI>
        <ArticleLI><strong>Iteration Planning</strong> (1–2 weeks) — next iteration scope and internal communication. Driven by development team, prioritizing by value, cost, risk.</ArticleLI>
        <ArticleLI><strong>Daily Planning</strong> (daily standup) — internal communication, individual work coordination, avoids duplicated effort.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Time-boxing mechanics</ArticleH2>
      <ArticleP>A time-box is the fixed time period during which development team members agree to complete a project activity. Any undone work is moved to the next iteration. Objective: establish a development rhythm for software artifacts produced and delivered to customers.</ArticleP>
      <ArticleH2>Product backlog and risk-aware estimation</ArticleH2>
      <ArticleUL>
        <ArticleLI>Iteration planning is adaptable through the product backlog (candidate software features to be delivered).</ArticleLI>
        <ArticleLI>The Product Owner is responsible for maximizing product value from the development work.</ArticleLI>
        <ArticleLI>Risk estimation includes team members&apos; velocity, availability, and distractions — not just schedule and cost.</ArticleLI>
        <ArticleLI>Project work projection is based on actual work progress rather than a predefined theoretical plan.</ArticleLI>
      </ArticleUL>
    </>
  );

  articles['SDLC & Agile Practices — Practice & Applications'] = (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">Evolutionary delivery, continuous collaboration, and Agile vs Traditional development comparison</p>
      </div>
      <ArticleH2>Evolutionary software development</ArticleH2>
      <ArticleUL>
        <ArticleLI>Delivers early, incremental and continuous working software — developed gradually, small portions at a time.</ArticleLI>
        <ArticleLI>Plans, requirements, designs, and features are adaptively refined at each iteration.</ArticleLI>
        <ArticleLI>Instead of defining all requirements upfront, agile teams decide on requirements as late as possible.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Continuous user involvement</ArticleH2>
      <ArticleUL>
        <ArticleLI>In every iteration, team and customers hold a meeting: team reports work done, customers provide feedback to refine features.</ArticleLI>
        <ArticleLI>Frequent releases allow customers to acquire knowledge on the current release and provide feedback.</ArticleLI>
        <ArticleLI>System integration occurs only when customers have no additional requirements.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Sustaining teamwork</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Self-organizing teams</strong> are accountable to deliver results, to each other, and to keep continuous flow.</ArticleLI>
        <ArticleLI><strong>Cross-functional teams</strong> include people from different functional areas — not only technical specialists but also business analysts, marketing specialists, etc.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Agile vs Traditional: comprehensive comparison</ArticleH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-3 py-2 text-left font-semibold">Aspect</th><th className="px-3 py-2 text-left font-semibold">Traditional</th><th className="px-3 py-2 text-left font-semibold">Agile</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-2">Underlying principle</td><td className="px-3 py-2">Specifiable and predictable; detailed planning</td><td className="px-3 py-2">Adaptive to changes; iterative improvement via feedback</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Management style</td><td className="px-3 py-2">Command and control</td><td className="px-3 py-2">Leadership and collaboration</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Communication</td><td className="px-3 py-2">Formal, document-based</td><td className="px-3 py-2">Informal, productive collaboration</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Development model</td><td className="px-3 py-2">Sequential</td><td className="px-3 py-2">Iterative/incremental/evolutionary</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Testing</td><td className="px-3 py-2">Late, after code is completed</td><td className="px-3 py-2">Continuous, in every iteration</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Requirements</td><td className="px-3 py-2">Defined in detail upfront, formally specified</td><td className="px-3 py-2">Defined informally, continuously gathered</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Cost of change</td><td className="px-3 py-2">High</td><td className="px-3 py-2">Low</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Customer involvement</td><td className="px-3 py-2">Low and late</td><td className="px-3 py-2">High, early and continuous</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Skills required</td><td className="px-3 py-2">Mainly technical</td><td className="px-3 py-2">Technical + interpersonal + business knowledge</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Project scale</td><td className="px-3 py-2">Medium scale</td><td className="px-3 py-2">Low and medium scale</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Team size</td><td className="px-3 py-2">Medium-large</td><td className="px-3 py-2">Small-medium</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Cost of redesign</td><td className="px-3 py-2">Expensive</td><td className="px-3 py-2">Not expensive</td></tr>
          </tbody>
        </table>
      </div>
      <ArticleH2>Summary</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Traditional</strong> emphasizes predictability, plan adherence, and late testing, with high change/restart cost.</ArticleLI>
        <ArticleLI><strong>Agile</strong> emphasizes adaptation to change, continuous testing, customer collaboration, and low change/restart cost.</ArticleLI>
      </ArticleUL>
    </>
  );

  // ── FMEA custom content ───────────────────────────────────────
  articles['Reliability & Failure Analysis (FMEA)'] = (
    <>
      <div className="mb-6"><p className="text-lg leading-[1.8] text-foreground/80">FMEA Overview, Industry Use, and Types of FMEA</p></div>
      <ArticleH2>What FMEA is</ArticleH2>
      <ArticleUL>
        <ArticleLI>Failure Modes and Effects Analysis (FMEA) is an analysis technique used to identify potential design or process problems.</ArticleLI>
        <ArticleLI>The method examines causal relationships and effects of lower level failures on devices or systems.</ArticleLI>
        <ArticleLI>FMEA identifies where actions or compensating provisions are needed to reduce the likelihood of problems and mitigate risk.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Industry use</ArticleH2>
      <ArticleP>FMEA project teams are made up of experts from engineering, manufacturing, etc. The team determines the effect of each failure, identifies single failure points that are critical, and ranks each failure according to probability and criticality.</ArticleP>
      <ArticleH2>Types of FMEA</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Conceptual FMEAs</strong> — used in early stages before hardware is defined</ArticleLI>
        <ArticleLI><strong>Functional FMEAs</strong> — focuses on functions</ArticleLI>
        <ArticleLI><strong>Design FMEAs (DFMEA)</strong> — identifies potential design failures before they occur; probably the most common FMEA</ArticleLI>
        <ArticleLI><strong>Process FMEAs (PFMEA)</strong> — recognizes and evaluates potential failure of a manufacturing process</ArticleLI>
      </ArticleUL>
      <ArticleH2>FMEA vs Forensics</ArticleH2>
      <ArticleP>Forensics focuses on determining what happened. FMEA focuses on anticipating what MIGHT occur, identifying possible issues, prioritizing actions for improvement, and documenting the process.</ArticleP>
      <ArticleH2>Why FMEA is important</ArticleH2>
      <ArticleUL>
        <ArticleLI>Provides a basis for identifying root failure causes and developing effective corrective actions</ArticleLI>
        <ArticleLI>Identifies reliability/safety of critical components</ArticleLI>
        <ArticleLI>Facilitates investigation of design alternatives at all stages</ArticleLI>
        <ArticleLI>Pro-active engineering quality method — works in early conception phase</ArticleLI>
        <ArticleLI>Widely used in engineering, industrial, medical, and business areas</ArticleLI>
      </ArticleUL>
      <ArticleH2>History</ArticleH2>
      <ArticleP>FMEA traces back to 1949 Military Procedure MIL-P-1629. Formally developed by NASA in the 1960s for space program hardware reliability. SAE J1739 is the prevalent standard in automotive; aerospace uses SAE ARP5590.</ArticleP>
    </>
  );

  articles['Reliability & Failure Analysis (FMEA) — Implementation'] = (
    <>
      <div className="mb-6"><p className="text-lg leading-[1.8] text-foreground/80">Core FMEA Definitions, Analysis Logic, and Implementation Steps</p></div>
      <ArticleH2>Core definitions</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Failure Mode</strong> — the way a failure is observed and its impact on equipment operation</ArticleLI>
        <ArticleLI><strong>Indenture Levels</strong> — levels identifying relative complexity of an assembly or function</ArticleLI>
        <ArticleLI><strong>Local Effect</strong> — consequence on the specific item being analyzed</ArticleLI>
        <ArticleLI><strong>Next Higher Level Effect</strong> — consequence on items in the next higher indenture level</ArticleLI>
        <ArticleLI><strong>Severity</strong> — worst possible consequence classified by degree of injury, damage, and mission loss</ArticleLI>
        <ArticleLI><strong>Single Point Failure</strong> — failure that can result in system failure, not compensated by redundancy</ArticleLI>
      </ArticleUL>
      <ArticleH2>Analysis logic: Bottom-up vs Top-down</ArticleH2>
      <ArticleP><strong>Bottom-to-top:</strong> What are the effects of part failures on the board? Board failures on the box? Box failures on the system? Propagates effects upward through indenture levels.</ArticleP>
      <ArticleP><strong>Top-to-bottom:</strong> What system-level failures could occur? What would cause them at assembly level? Board level? Component level? Decomposes system failures into causes at lower levels.</ArticleP>
      <ArticleH2>FMEA implementation steps</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>1. Define the system</strong> — list subassemblies, components, basic functions, environmental/operational parameters</ArticleLI>
        <ArticleLI><strong>2. Identify potential failures</strong> — use Free-body Diagrams, Storyboards, Process-flow diagrams, brainstorming</ArticleLI>
        <ArticleLI><strong>3. List possible causes</strong> — enumerate mechanisms that could lead to each failure mode</ArticleLI>
        <ArticleLI><strong>4. List potential effects</strong> — noise, fire, erratic performance, fit problems, durability issues, etc.</ArticleLI>
        <ArticleLI><strong>5. Rate Occurrence (O)</strong> — likelihood that the cause will produce the failure mode</ArticleLI>
        <ArticleLI><strong>6. Estimate Severity (S)</strong> — how severe the customer perceives the failure effect</ArticleLI>
        <ArticleLI><strong>7. Assess Detection (D)</strong> — effectiveness of controls to prevent/detect the cause before it reaches the customer</ArticleLI>
        <ArticleLI><strong>8. Calculate RPN</strong> — Risk Priority Number = S × O × D</ArticleLI>
        <ArticleLI><strong>9. Develop corrective actions</strong> — on a priority basis using RPN ranking</ArticleLI>
        <ArticleLI><strong>10. Implement and re-evaluate</strong> — repeat RPN analysis to determine effectiveness</ArticleLI>
      </ArticleUL>
    </>
  );

  articles['Reliability & Failure Analysis (FMEA) — Practice & Applications'] = (
    <>
      <div className="mb-6"><p className="text-lg leading-[1.8] text-foreground/80">FMECA, Concept FMEA, and Practical Application</p></div>
      <ArticleH2>FMECA: FMEA + Criticality Analysis</ArticleH2>
      <ArticleUL>
        <ArticleLI>FMECA is an extension of FMEA — it combines failure/effect identification with a criticality step.</ArticleLI>
        <ArticleLI>The added Criticality Analysis (CA) evaluates how often the identified problems occur (frequency).</ArticleLI>
        <ArticleLI>Two steps: (1) Failure Mode and Effect Analysis, (2) Criticality Analysis.</ArticleLI>
      </ArticleUL>
      <ArticleH2>Concept FMEA (CFMEA)</ArticleH2>
      <ArticleUL>
        <ArticleLI>Used to analyze concepts in early stages before hardware is defined.</ArticleLI>
        <ArticleLI>Applied at system and subsystem level.</ArticleLI>
        <ArticleLI>Focuses on potential failure modes associated with proposed functions of a concept proposal.</ArticleLI>
        <ArticleLI>Includes interaction of multiple systems and elements at concept stages.</ArticleLI>
      </ArticleUL>
      <ArticleH2>O/S/D Ratings explained</ArticleH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-3 py-2 text-left font-semibold">Rating</th><th className="px-3 py-2 text-left font-semibold">Meaning</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-2 font-semibold">O (Occurrence)</td><td className="px-3 py-2">Likelihood that a cause will produce the failure mode and its specific effect</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-semibold">S (Severity)</td><td className="px-3 py-2">How severe the failure is or how severe the customer perceives the effect</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-semibold">D (Detection)</td><td className="px-3 py-2">How effective existing controls are at preventing/detecting the cause before it reaches the customer</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2 font-semibold">RPN</td><td className="px-3 py-2">Risk Priority Number = S × O × D — used to rank and prioritize corrective actions</td></tr>
          </tbody>
        </table>
      </div>
      <ArticleH2>Example failure modes</ArticleH2>
      <ArticleP>Acoustic noise, fracture, seizure, binding, intermittent operation, staining, buckling, leaks, stall, burning, corrosion, misalignment, surge, cracking, open circuit, thermal expansion, creep, oxidation, deflection/deformation, radiation damage, UV deterioration, delamination, resonance, vibrations, electrical short, wear, erosion, fatigue, scoring.</ArticleP>
    </>
  );

  // ── CFD custom content ───────────────────────────────────────
  articles['Computational Fluid Dynamics (CFD)'] = (
    <>
      <div className="mb-6"><p className="text-lg leading-[1.8] text-foreground/80">CAE, CFD Overview, Objectives, and Where/Why CFD Is Used</p></div>
      <ArticleH2>CAE background and role of CFD</ArticleH2>
      <ArticleP>Computer-Aided Engineering (CAE) is the broad usage of computer software to aid in engineering analysis tasks. It includes FEA, CFD, Multi-body dynamics, and Optimization. In CAE systems, CFD contributes analysis results that support design-team decision making.</ArticleP>
      <ArticleH2>What CFD is</ArticleH2>
      <ArticleP>Computational Fluid Dynamics (CFD) deals with the solution of fluid dynamics and heat transfer problems using numerical techniques. CFD is an alternative to measurements for solving large-scale fluid dynamical systems and has evolved as a design tool across industries: Aerospace, Mechanical, Automobile, Chemical, Metallurgical, Electronics, and Food processing.</ArticleP>
      <ArticleH2>CFD workflow phases</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Pre-processing</strong> — define geometry model, physical model, and boundary conditions</ArticleLI>
        <ArticleLI><strong>Computing</strong> — performed on high-powered computers (HPC)</ArticleLI>
        <ArticleLI><strong>Post-processing</strong> — use scientific visualization tools to process results</ArticleLI>
      </ArticleUL>
      <ArticleH2>Why use CFD</ArticleH2>
      <ArticleUL>
        <ArticleLI>Simulation-based design instead of &ldquo;build &amp; test&rdquo; — more cost effective and rapid</ArticleLI>
        <ArticleLI>High-fidelity database to interrogate the flow field</ArticleLI>
        <ArticleLI>Simulate phenomena difficult to measure: full-scale ships/airplanes, explosions, weather prediction</ArticleLI>
      </ArticleUL>
      <ArticleH2>CFD vs Experiment</ArticleH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-3 py-2 text-left font-semibold">Aspect</th><th className="px-3 py-2 text-left font-semibold">CFD</th><th className="px-3 py-2 text-left font-semibold">Experiment</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-2">Cost</td><td className="px-3 py-2">Cheap</td><td className="px-3 py-2">Expensive</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Time</td><td className="px-3 py-2">Short</td><td className="px-3 py-2">Long</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Scale</td><td className="px-3 py-2">Any</td><td className="px-3 py-2">Small/Middle</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Information</td><td className="px-3 py-2">Complete coverage</td><td className="px-3 py-2">Measured points only</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Safety</td><td className="px-3 py-2">Safe</td><td className="px-3 py-2">Some dangerous</td></tr>
          </tbody>
        </table>
      </div>
      <ArticleH2>Application domains</ArticleH2>
      <ArticleP>Aerospace, Appliances, Automotive (external aerodynamics, interior ventilation, engine cooling), Biomedical, Chemical Processing, HVAC&amp;R, Hydraulics, Marine, Oil &amp; Gas, Power Generation, Sports.</ArticleP>
    </>
  );

  articles['Computational Fluid Dynamics (CFD) — Implementation'] = (
    <>
      <div className="mb-6"><p className="text-lg leading-[1.8] text-foreground/80">Physics of Fluids, Governing Equations, and Numerical Discretization</p></div>
      <ArticleH2>Fluid properties</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Density (ρ)</strong> — Air: 1.275 kg/m³, Water: 1000 kg/m³, Honey: 1446 kg/m³</ArticleLI>
        <ArticleLI><strong>Viscosity (μ)</strong> — resistance to flow. Air: 1.82e-4 P, Water: 1.002e-2 P, Honey: 190 P</ArticleLI>
      </ArticleUL>
      <ArticleH2>Fluid mechanics categories</ArticleH2>
      <ArticleUL>
        <ArticleLI>Inviscid vs Viscous (Re)</ArticleLI>
        <ArticleLI>Laminar vs Turbulent (Re)</ArticleLI>
        <ArticleLI>Internal (pipe, valve) vs External (airfoil, ship)</ArticleLI>
        <ArticleLI>Compressible (Ma) vs Incompressible</ArticleLI>
        <ArticleLI>Single- vs Multi-phase (Ca)</ArticleLI>
      </ArticleUL>
      <ArticleH2>Navier–Stokes governing equations</ArticleH2>
      <ArticleP><strong>Mass conservation (continuity):</strong> Compressible: ∂ρ/∂t + ∂(ρUᵢ)/∂xᵢ = 0. Incompressible (ρ constant): ∂Uᵢ/∂xᵢ = 0.</ArticleP>
      <ArticleP>Momentum and Energy conservation complete the Navier–Stokes system — a system of three nonlinear second-order equations in four independent variables (x, y, z, t).</ArticleP>
      <ArticleH2>Discretization methods</ArticleH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-3 py-2 text-left font-semibold">Method</th><th className="px-3 py-2 text-left font-semibold">Advantage</th><th className="px-3 py-2 text-left font-semibold">Disadvantage</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-2">FDM</td><td className="px-3 py-2">Straightforward, simple for beginners</td><td className="px-3 py-2">Not suitable for complex geometries/high Re</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">FEM</td><td className="px-3 py-2">Handles complicated boundaries; strong in solid mechanics</td><td className="px-3 py-2">Complex matrix operations; limited for high Re flows</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">FVM</td><td className="px-3 py-2">Physical soundness; any geometry</td><td className="px-3 py-2">Not as straightforward as FDM</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Spectral</td><td className="px-3 py-2">Combines with standard FDMs</td><td className="px-3 py-2">Complex boundary conditions</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );

  articles['Computational Fluid Dynamics (CFD) — Practice & Applications'] = (
    <>
      <div className="mb-6"><p className="text-lg leading-[1.8] text-foreground/80">Computational Setup: Grids, Boundary Conditions, PDE Classification, and Solvers</p></div>
      <ArticleH2>Grid types</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Structured grid</strong> — all nodes have the same number of elements; only for simple domains</ArticleLI>
        <ArticleLI><strong>Unstructured grid</strong> — for all geometries; irregular data structure</ArticleLI>
        <ArticleLI><strong>Block structured grid</strong> — hybrid approach</ArticleLI>
      </ArticleUL>
      <ArticleH2>Boundary conditions</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>No-slip (Wall)</strong>: u = 0, v = 0</ArticleLI>
        <ArticleLI><strong>Inlet</strong>: u = c, v = 0</ArticleLI>
        <ArticleLI><strong>Outlet</strong>: du/dx = 0, dv/dy = 0, dp/dx = 0</ArticleLI>
        <ArticleLI><strong>Axisymmetric</strong>: v = 0, dp/dr = 0, du/dr = 0</ArticleLI>
        <ArticleLI><strong>Periodic</strong>: periodic boundary condition in spanwise direction</ArticleLI>
      </ArticleUL>
      <ArticleH2>PDE classification</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Elliptic</strong> (b² − 4ac &lt; 0): Laplace/Poisson equations — closed domain with boundary conditions</ArticleLI>
        <ArticleLI><strong>Parabolic</strong> (b² − 4ac = 0): Heat conduction — solution advances from initial values</ArticleLI>
        <ArticleLI><strong>Hyperbolic</strong> (b² − 4ac &gt; 0): Wave equation — requires two initial conditions</ArticleLI>
      </ArticleUL>
      <ArticleH2>N-S equation properties</ArticleH2>
      <ArticleUL>
        <ArticleLI>Hyperbolic: unsteady inviscid compressible flow; can sustain shock waves</ArticleLI>
        <ArticleLI>Parabolic: boundary layer flows (solution marches downstream)</ArticleLI>
        <ArticleLI>Elliptic: subsonic inviscid flow with recirculation</ArticleLI>
        <ArticleLI>Mixed: steady transonic flow (supersonic = hyperbolic, subsonic = elliptic)</ArticleLI>
      </ArticleUL>
      <ArticleH2>Solvers</ArticleH2>
      <ArticleUL>
        <ArticleLI><strong>Direct</strong>: Cramer&apos;s rule, Gauss elimination, LU decomposition</ArticleLI>
        <ArticleLI><strong>Iterative</strong>: Jacobi method, Gauss-Seidel method, SOR method</ArticleLI>
      </ArticleUL>
      <ArticleH2>Boundary condition types (heat conduction)</ArticleH2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="px-3 py-2 text-left font-semibold">Type</th><th className="px-3 py-2 text-left font-semibold">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-2">Dirichlet (1st Kind)</td><td className="px-3 py-2">Values of dependent variables specified at boundaries</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Neumann (2nd Kind)</td><td className="px-3 py-2">Derivative of dependent variable given at boundary (e.g., insulation)</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Cauchy</td><td className="px-3 py-2">Combines both Dirichlet and Neumann conditions</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-2">Robbins (3rd Kind)</td><td className="px-3 py-2">Derivative given as function of dependent variable (e.g., cooling with heat transfer coefficient h)</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );

  if (articles[lessonTitle]) return articles[lessonTitle];

  // ── Topic-aware content generation ────────────────────────────
  // Derive context from the lesson title and skill name
  const title = lessonTitle;
  const skill = skillName;
  const titleLower = title.toLowerCase();

  // Determine domain context
  const isML = /machine learning|neural|deep learning|model|training|algorithm|classification|regression|clustering/i.test(title + skill);
  const isData = /data|sql|database|query|analytics|visualization|pipeline|etl|wrangling/i.test(title + skill);
  const isSecurity = /security|threat|vulnerability|penetration|cryptography|firewall|incident|siem|forensic/i.test(title + skill);
  const isCloud = /cloud|docker|kubernetes|ci\/cd|infrastructure|deployment|terraform|devops|monitoring/i.test(title + skill);
  const isProduct = /product|roadmap|user research|wireframe|agile|sprint|stakeholder|requirement/i.test(title + skill);
  const isMech = /cad|fea|thermal|fluid|manufacturing|mechanical|design|simulation|cfd|plc|robot/i.test(title + skill);

  const domainContext = isML ? 'machine learning and AI engineering'
    : isData ? 'data engineering and analytics'
    : isSecurity ? 'cybersecurity and threat management'
    : isCloud ? 'cloud infrastructure and DevOps'
    : isProduct ? 'product management and strategy'
    : isMech ? 'mechanical engineering and design'
    : 'software engineering';

  // Generate 4 contextual bullet points based on the topic
  const bullets = isML ? [
    { label: 'Mathematical foundations', text: `Understand the linear algebra, probability, and calculus concepts that underpin ${title}. These form the basis for understanding why algorithms work.` },
    { label: 'Implementation patterns', text: `Learn the standard implementation patterns and APIs used in practice. Focus on scikit-learn, PyTorch, or TensorFlow depending on the task.` },
    { label: 'Evaluation metrics', text: `Know how to measure model performance — accuracy, precision, recall, F1, AUC-ROC. Choose the right metric for your problem type.` },
    { label: 'Common pitfalls', text: `Avoid overfitting, data leakage, and class imbalance issues. These are the most frequent mistakes in real-world ML projects.` },
  ] : isData ? [
    { label: 'Data quality', text: `Understand how to identify and handle missing values, duplicates, outliers, and schema inconsistencies in ${title}.` },
    { label: 'Transformation patterns', text: `Learn the standard transformation operations — filtering, aggregation, joins, pivots — and when to apply each.` },
    { label: 'Performance at scale', text: `Understand how to optimize queries and pipelines for large datasets using partitioning, indexing, and distributed processing.` },
    { label: 'Tooling ecosystem', text: `Get familiar with the standard tools: Pandas for in-memory processing, SQL for relational data, Spark for distributed workloads.` },
  ] : isSecurity ? [
    { label: 'Threat landscape', text: `Understand the attack vectors and threat actors relevant to ${title}. Know the MITRE ATT&CK framework and how it maps to real incidents.` },
    { label: 'Defense mechanisms', text: `Learn the controls, tools, and processes used to detect, prevent, and respond to threats in this domain.` },
    { label: 'Compliance requirements', text: `Understand relevant standards — OWASP, NIST, ISO 27001 — and how they apply to your organization's security posture.` },
    { label: 'Incident response', text: `Know the steps to take when a security event occurs: detection, containment, eradication, recovery, and lessons learned.` },
  ] : isCloud ? [
    { label: 'Infrastructure concepts', text: `Understand the core infrastructure primitives — compute, storage, networking — and how they map to cloud provider services.` },
    { label: 'Automation first', text: `Everything in ${title} should be automated and version-controlled. Manual changes are a source of drift and incidents.` },
    { label: 'Observability', text: `Instrument your systems with metrics, logs, and traces from day one. You cannot fix what you cannot see.` },
    { label: 'Security by default', text: `Apply least-privilege access, encrypt data at rest and in transit, and scan infrastructure code for misconfigurations.` },
  ] : isMech ? [
    { label: 'Engineering fundamentals', text: `Ground your understanding in the physics and mathematics that govern ${title}. First-principles thinking prevents costly design errors.` },
    { label: 'Tooling proficiency', text: `Develop hands-on proficiency with the industry-standard software tools. Employers expect practical skills, not just theoretical knowledge.` },
    { label: 'Design constraints', text: `Every engineering decision involves trade-offs between performance, cost, weight, manufacturability, and safety. Learn to reason about these explicitly.` },
    { label: 'Standards compliance', text: `Understand the relevant industry standards and codes. Non-compliance is not an option in regulated engineering domains.` },
  ] : [
    { label: 'Core theory', text: `Understand the foundational principles behind ${title}. These principles determine the correctness and efficiency of your implementations.` },
    { label: 'Common patterns', text: `Recognize the recurring templates and strategies that appear in problems related to this topic. Pattern recognition separates efficient engineers from brute-force coders.` },
    { label: 'Trade-off analysis', text: `For every approach, analyze the trade-offs — time vs. space, consistency vs. availability, simplicity vs. performance. Articulate these clearly.` },
    { label: 'Edge cases', text: `Identify boundary conditions that can break naive implementations. Handling edge cases correctly is what separates production-ready code from prototypes.` },
  ];

  return (
    <>
      <div className="mb-6">
        <p className="text-lg leading-[1.8] text-foreground/80">
          Master the core concepts and practical techniques of <strong>{title}</strong> in the context of {domainContext}. This lesson builds the foundation you need to apply these skills confidently in real projects and technical interviews.
        </p>
      </div>

      <ArticleP>
        {title} is a critical skill in {skill}. Understanding it deeply — not just the syntax or steps, but the underlying reasoning — is what allows you to adapt when problems don't match the textbook examples.
      </ArticleP>

      <ArticleH2>What you need to know</ArticleH2>

      <ArticleUL>
        {bullets.map((b, i) => (
          <ArticleLI key={i}><strong>{b.label}:</strong> {b.text}</ArticleLI>
        ))}
      </ArticleUL>

      <NoteCallout>
        <p><strong>Note:</strong> Focus on understanding the "why" behind each concept in {title}, not just memorizing steps. Real-world problems rarely match textbook examples exactly — your ability to reason from first principles is what matters.</p>
      </NoteCallout>

      <ArticleH2>How this applies in practice</ArticleH2>

      <ArticleP>
        In {domainContext}, {titleLower} comes up in multiple contexts — from day-to-day engineering work to system design interviews and production incidents. Here's where you'll encounter it:
      </ArticleP>

      <ArticleUL>
        <ArticleLI><strong>Technical interviews:</strong> Expect questions that test both your theoretical understanding and your ability to implement solutions under time pressure.</ArticleLI>
        <ArticleLI><strong>Production systems:</strong> The same principles that solve interview problems guide architectural decisions in real software. Getting this right prevents costly rework.</ArticleLI>
        <ArticleLI><strong>Code and design reviews:</strong> Understanding {titleLower} deeply helps you evaluate others' work and suggest meaningful improvements.</ArticleLI>
      </ArticleUL>

      <InfoCallout>
        <p><strong>Tip:</strong> As you work through this topic, connect it to what you've already learned in {skill}. The strongest engineers can draw connections across topics and choose the right tool for each situation.</p>
      </InfoCallout>

      <ArticleP>
        Continue to the next lesson to build on these foundations. Each topic in this course layers on top of what came before — take the time to solidify your understanding here before moving forward.
      </ArticleP>
    </>
  );
}

/* ── Custom Flashcard Content for CFD and FMEA ────────────────── */
const customFlashcardContent: Record<string, { q: string; a: string }[]> = {
  'Database Management System': [
    // Page 1: Core Concepts (8 cards)
    { q: 'What is a database and what is an RDBMS?', a: 'A database is a systematic collection of data. An RDBMS (Relational Database Management System) is a collection of tools that allow users to organize, manipulate, and visualize databases following relational standards.' },
    { q: 'What is SQL and how does it differ from MySQL?', a: 'SQL is a language/protocol for querying databases. MySQL is an RDBMS — a database management system. SQL communicates with the database; MySQL provides the interface to connect and manage databases.' },
    { q: 'What core operations can SQL perform?', a: 'Create/Delete databases, Create/Delete tables, SELECT data, INSERT data, UPDATE data, DELETE data, Create Views, Execute aggregate functions.' },
    { q: 'How is data organized in SQL databases?', a: 'Data is organized into tables. One database contains multiple tables (e.g., Customers, Orders, Menu Items). Tables can have relations — SQL joins combine values from different tables.' },
    { q: 'What do you need to create a table in SQL?', a: 'Two things: (1) All the fields you want to store, (2) The data type for each field. Example: name → varchar, phone → varchar, postalCode → INT. Add an ID column for unique identification.' },
    { q: 'What common RDBMS tools are available?', a: 'MySQL, Oracle, Microsoft SQL Server, PostgreSQL, Heidi SQL. After installing an RDBMS, you get tools to interact with your database and a Query Editor to type SQL queries.' },
    { q: 'What is the difference between CHAR and VARCHAR?', a: 'CHAR(size) is a fixed-length string (0–255). VARCHAR(size) is a variable-length string (0–65535). Use CHAR for fixed-size data like country codes; VARCHAR for variable data like names.' },
    { q: 'What are the main categories of SQL data types?', a: 'String: CHAR, VARCHAR, TEXT, ENUM, SET. Numeric: INT, FLOAT, DECIMAL, BOOL, BIT. Date/Time: DATE, TIME, DATETIME, TIMESTAMP, YEAR.' },
    // Page 2: Implementation (8 cards)
    { q: 'Write the SQL to create and drop a Customers table.', a: 'CREATE TABLE customers(ID INT NOT NULL, name varchar(50), phone varchar(15), postalCode INT); DROP TABLE customers;' },
    { q: 'What does CRUD stand for and what are the SQL commands?', a: 'Create = INSERT, Read = SELECT, Update = UPDATE, Delete = DELETE. These are the four fundamental operations on any database.' },
    { q: 'How do you INSERT data into a table?', a: 'INSERT INTO customers(ID,name,phone,postalCode) VALUES(1,\'Alice\',\'+123456789\',123456); You can also insert multiple rows: INSERT INTO Users(name) VALUES (\'user1\'),(\'user2\');' },
    { q: 'How do you SELECT data from a table?', a: 'Specific columns: SELECT name, phone FROM customers; All columns: SELECT * FROM customers; Filtered: SELECT * FROM customers WHERE postalCode > 100000;' },
    { q: 'How do you UPDATE and DELETE data?', a: 'UPDATE customers SET phone=\'+222\' WHERE ID=2; DELETE FROM customers WHERE postalCode=223344; Without WHERE, UPDATE/DELETE affects all rows.' },
    { q: 'What are numeric data types in SQL?', a: 'INT: -2B to 2B. TINYINT: -128 to 127. BIGINT: very large range. FLOAT(p): floating-point. DECIMAL(size,d): exact fixed-point. BOOL: 0=FALSE, non-zero=TRUE.' },
    { q: 'What are date/time data types in SQL?', a: 'DATE: YYYY-MM-DD. TIME: hh:mm:ss. DATETIME: YYYY-MM-DD hh:mm:ss. TIMESTAMP: Unix timestamp since 1970. YEAR: four-digit year (1901–2155).' },
    { q: 'What is the difference between TEXT, BLOB, and ENUM?', a: 'TEXT: holds strings up to 65,536 bytes. BLOB: holds binary data up to 65,536 bytes. ENUM: a string that can have only one value from a predefined list (up to 65,535 values).' },
    // Page 3: Applications (8 cards)
    { q: 'What is a Primary Key vs Foreign Key?', a: 'Primary Key: uniquely identifies a row, one per table, cannot be NULL. Foreign Key: references the PRIMARY KEY of another table, creating parent-child relationships between tables.' },
    { q: 'Name the four SQL JOIN types and what they return.', a: 'INNER JOIN: matching records in both tables. LEFT JOIN: all from first + matching from second. RIGHT JOIN: all from second + matching from first. FULL JOIN: all records from both tables.' },
    { q: 'List key SQL logical operators.', a: 'AND, OR, NOT, BETWEEN, IN, LIKE, EXISTS, ALL, ANY, SOME. Used in WHERE and ON clauses to filter data.' },
    { q: 'How do you sort, limit, and aggregate in SQL?', a: 'Sort: ORDER BY col ASC/DESC. Limit: LIMIT 20. Offset: OFFSET 10 ROWS. Aggregate: AVG(age), COUNT(*), SUM(), MIN(), MAX().' },
    { q: 'How do you use aliases and joins together?', a: 'SELECT us.name, wall.balance FROM Users AS us INNER JOIN Wallets AS wall ON us.walletId = wall.walletId; AS gives a short alias to table names.' },
    { q: 'How do you filter with AND, OR, IN, BETWEEN?', a: 'AND: WHERE age>=18 AND country=\'india\'. OR: WHERE country=\'india\' OR name LIKE \'Kan%\'. IN: WHERE age IN (15,18,22). BETWEEN: WHERE age BETWEEN 25 AND 30.' },
    { q: 'How do you get distinct values and count rows?', a: 'DISTINCT: SELECT DISTINCT country FROM Users; COUNT: SELECT COUNT(*) FROM Users WHERE age>18; These help analyze unique values and row counts.' },
    { q: 'How do you insert multiple rows and update selectively?', a: 'Multiple insert: INSERT INTO Users(name) VALUES (\'user1\'),(\'user2\'); Selective update: UPDATE Users SET isEligible=\'true\' WHERE age>=18; Selective delete: DELETE FROM Users WHERE age<18;' },
  ],
  'SDLC & Agile Practices': [
    // Page 1: Core Concepts (8 cards)
    { q: 'What is Agile SDLC and what is the Agile Manifesto?', a: 'Agile SDLC is a combination of iterative and incremental models focused on adaptability and customer satisfaction. The Agile Manifesto (2001) has 4 core values and 12 principles — foundation of all Agile methods.' },
    { q: 'How does Traditional SDLC differ from Agile?', a: 'Traditional: rigid, sequential, requires all requirements upfront, heavy documentation. Agile: iterative, flexible, evolving requirements, lightweight, customer-focused.' },
    { q: 'What are the 4 Agile Manifesto values?', a: 'Individuals & interactions over processes & tools. Working software over documentation. Customer collaboration over contract negotiation. Responding to change over following a plan.' },
    { q: 'What are iterations and releases in Agile?', a: 'Iterations: small development cycles implementing user stories as features. Releases: a series of iterations producing a deployable system version. Each iteration incrementally evolves the product.' },
    { q: 'List key characteristics of Agile SD.', a: 'Emphasis on code over design. Iterative approach. Quick delivery of working software. Adaptive to changing requirements. Active customer involvement. People-based development.' },
    { q: 'Name common Agile methods.', a: 'Extreme Programming (XP), SCRUM, KANBAN, DSDM, FDD (Feature-Driven Development), Crystal Family of methods. All follow the Agile Manifesto principles.' },
    { q: 'What are the first 4 Agile Principles?', a: '1. Satisfy customer through early/continuous delivery. 2. Welcome changing requirements. 3. Deliver working software frequently (weeks, not months). 4. Business people and developers work together daily.' },
    { q: 'Why do traditional models struggle with change?', a: 'They freeze requirements and design early. Changes during lifecycle are difficult and expensive. Success relies on knowing ALL requirements before design begins. Sequential execution means late testing.' },
    // Page 2: Implementation (8 cards)
    { q: 'What are the three Agile planning levels?', a: 'Release Planning (monthly): overall scope, decided by customers/PO. Iteration Planning (1-2 weeks): next iteration scope, driven by dev team. Daily Planning (standup): individual work coordination.' },
    { q: 'What is time-boxing in Agile?', a: 'A fixed time period during which the team agrees to complete an activity. Undone work moves to next iteration. Establishes a development rhythm for delivery.' },
    { q: 'What is the Product Backlog and who manages it?', a: 'The product backlog is a list of candidate features to be delivered. The Product Owner manages it, maximizing product value. The plan is updated continuously based on needs and priorities.' },
    { q: 'What makes Agile human-centric?', a: 'Build projects around motivated individuals. Face-to-face conversation is most efficient. Self-organizing teams produce best results. Sustainable pace — avoid burnout.' },
    { q: 'How does Agile handle risk estimation?', a: 'Not limited to schedule/cost — includes team velocity, availability, distractions. Uses estimate ranges for uncertainties. Projection based on actual progress, not theoretical plans.' },
    { q: 'What is the primary measure of progress in Agile?', a: 'Working software is the primary measure. Progress demonstrated through frequent deliveries. Continuous attention to technical excellence enhances agility. Simplicity: maximize work NOT done.' },
    { q: 'How do self-organizing teams work?', a: 'Teams produce best architectures, requirements, and designs. At regular intervals, teams reflect on effectiveness and adjust behavior. Cross-functional: includes designers, developers, QA, business analysts.' },
    { q: 'What communication tools does Agile use?', a: 'Open-plan workspaces, visible boards (whiteboards/task boards), post-it notes for feature status, user story cards, daily stand-ups, retrospective meetings, release planning workshops.' },
    // Page 3: Applications (8 cards)
    { q: 'How does evolutionary delivery work?', a: 'Software developed gradually in small portions. Plans/requirements refined each iteration. Requirements decided as late as possible. Integration only when customers have no additional requirements.' },
    { q: 'How does continuous user involvement work?', a: 'Every iteration: team reports work, customers give feedback. Frequent releases let customers acquire knowledge and refine requirements. Developers stay informed to make needed adjustments.' },
    { q: 'Compare cost of change: Traditional vs Agile.', a: 'Traditional: HIGH cost of change, HIGH restart cost, LOW customer involvement. Agile: LOW cost of change, LOW restart cost, HIGH continuous customer involvement.' },
    { q: 'Compare testing approach: Traditional vs Agile.', a: 'Traditional: sequential testing, performed late after code complete. Agile: continuous testing in every iteration of requirements, design, and implementation.' },
    { q: 'What skills does Agile require vs Traditional?', a: 'Traditional: mainly technical skills. Agile: technical + interpersonal/soft skills + business knowledge. Agile teams are small-medium; Traditional teams are medium-large.' },
    { q: 'Compare management style: Traditional vs Agile.', a: 'Traditional: command and control, formal document-based communication, bureaucratic structure. Agile: leadership and collaboration, informal productive communication, flexible participative structure.' },
    { q: 'How does Agile handle architecture and redesign?', a: 'Traditional: design represents ALL specified requirements, redesign is expensive. Agile: design represents current iteration requirements, redesign is not expensive. Cost of redesign is much lower.' },
    { q: 'What are the primary priorities in each approach?', a: 'Traditional: coherence to plan is key priority. Agile: customer satisfaction and business ROI are key priorities. Agile values adherence to customer value over adherence to plan.' },
  ],
  'Computational Fluid Dynamics (CFD)': [
    // Page 1: Core Concepts (8 cards)
    { q: 'What is Computer-Aided Engineering (CAE), and which disciplines does it commonly include?', a: 'CAE is the use of computer software to support engineering analysis. It includes: Finite Element Analysis (FEA), Computational Fluid Dynamics (CFD), Multi-body dynamics (MBD), Optimization. It helps in simulation, validation, and design improvement before physical prototypes.' },
    { q: 'How does CFD differ from physical testing, and what problems does it solve?', a: 'CFD uses numerical simulation instead of experiments. It solves: Fluid flow, Heat transfer, Mass transfer, Chemical reactions. It is useful when experiments are expensive, difficult, or unsafe.' },
    { q: 'Describe the three phases of CFD workflow.', a: '1. Pre-processing: Define geometry, physics, and boundary conditions. 2. Computing: Run simulations on computers. 3. Post-processing: Analyze and visualize results.' },
    { q: 'What does CFD predict and how is it used?', a: 'CFD predicts: Flow field, Heat transfer, Mass transfer, Chemical reactions. Uses: Design studies, Hazard analysis, Redesign, Reducing experimental effort.' },
    { q: 'Why use CFD instead of "build & test"?', a: 'Saves cost and time, Simulates difficult or dangerous conditions, Helps understand flow physics.' },
    // Page 2: Implementation (8 cards)
    { q: 'Examples where CFD is useful instead of experiments?', a: 'Scale: Ships, airplanes. Hazards: Explosions, radiation, pollution.' },
    { q: 'Where is CFD used? Give examples.', a: 'Used in aerospace, automotive, biomedical, etc. Examples: Aerospace: wing interaction, Automotive: aerodynamics, Biomedical: blood flow simulations.' },
    { q: 'Difference between compressible and incompressible continuity equations?', a: 'Compressible: density changes. Incompressible: density constant, divergence = 0. In incompressible flow → Dρ/Dt = 0.' },
    { q: 'How do momentum and energy equations work in Navier–Stokes?', a: 'Momentum includes pressure, viscosity, and forces. Energy includes heat transfer and dissipation. Flow types depend on Reynolds and Mach numbers.' },
    { q: 'Difference between FDM, FEM, FVM, Spectral methods?', a: 'FDM: simple grids. FEM: complex geometry handling. FVM: conservation-based (most robust). Spectral: high accuracy for smooth problems.' },
    // Page 3: Applications (8 cards)
    { q: 'Explain core FVM formulation.', a: 'Based on control volume integration. Includes: Time change, Surface flux, Source terms. Discretized equation links neighboring cells.' },
    { q: 'Structured vs unstructured grids?', a: 'Structured: simple geometry, regular pattern. Unstructured: complex geometry, flexible mesh.' },
    { q: 'Role of boundary & initial conditions?', a: 'Required for unique solution. Examples: No-slip wall, Inlet velocity, Outlet conditions. Initial conditions define starting state.' },
    { q: 'Classification of PDEs (elliptic, parabolic, hyperbolic)?', a: 'Using (b² - 4ac): < 0 → Elliptic (Laplace), = 0 → Parabolic (heat equation), > 0 → Hyperbolic (wave equation).' },
    { q: 'How to control convergence in numerical methods?', a: 'Residual monitoring, Under-relaxation, Convergence criteria, Iteration count, Multigrid (faster convergence), Parallelization (faster computation).' },
  ],
  'Reliability & Failure Analysis (FMEA)': [
    // Page 1: Core Concepts (8 cards)
    { q: 'How does FMEA help prevent problems and differ from forensics?', a: 'FMEA is proactive → identifies possible failures before they happen. Helps reduce occurrence and mitigate risks. Forensics is reactive → investigates failures after they occur.' },
    { q: 'What does a team do in FMEA and which types are used?', a: 'Team actions: Identify failure modes, Analyze effects, Prioritize risks, Plan corrective actions. Types: Conceptual FMEA, Functional FMEA, DFMEA → design-related, PFMEA → manufacturing process-related.' },
    { q: 'Difference between FMEA/FMECA and forensics + importance?', a: 'FMEA/FMECA → prevention & improvement (proactive). Forensics → post-failure analysis (reactive). Importance: Improves safety & reliability, Identifies weak points, Widely used (NASA, military, automotive standards).' },
    { q: 'Failure Mode vs Effect + indenture levels?', a: 'Failure Mode: how failure occurs. Effect: consequence of failure. Indenture levels: Help track effects from part → system. Includes local effect and next higher-level effect.' },
    { q: 'Explain bottom-to-top FMEA logic.', a: 'Start from part → board → system. Ask at each level: "What is the effect at next level?" Effects propagate upward through hierarchy.' },
    // Page 2: Implementation (8 cards)
    { q: 'Severity & Single Point Failure relationship?', a: 'Severity: worst-case consequence. Single Point Failure: no backup → system failure. High severity used to prioritize critical risks.' },
    { q: 'What is included in "Define the system"?', a: 'List components & functions. Include operating conditions: temperature, pressure, vibration. Ensures realistic failure analysis.' },
    { q: 'How are failure modes identified?', a: 'Based on physics of failure. Methods: diagrams (FBD, flowcharts), brainstorming, past designs, simulations.' },
    { q: 'What are causes/mechanisms and effects?', a: 'Causes: reasons for failure. Effects: consequences. Examples: noise, vibration, fire, failure, poor performance, reduced life.' },
    { q: 'What are O, S, D in FMEA?', a: 'O (Occurrence): likelihood of failure. S (Severity): impact level. D (Detection): ability to detect before reaching customer.' },
    // Page 3: Applications (8 cards)
    { q: 'Calculate RPN (O=4, S=7, D=3)', a: 'RPN = S × O × D = 7 × 4 × 3 = 84. Higher RPN → higher priority.' },
    { q: 'Why feed results back into design?', a: 'FMEA is for improvement, not just analysis. Use RPN to: prioritize actions, assign responsibility, schedule fixes.' },
    { q: 'What after corrective actions?', a: 'Recalculate RPN. Check if risk reduced. Confirms effectiveness of improvements.' },
    { q: 'Relation between FMEA and FMECA?', a: 'FMEA → identifies failures & effects. FMECA → adds criticality (frequency + importance). Helps prioritize risks better.' },
    { q: 'When to use Concept FMEA (CFMEA)?', a: 'Used in early design stage. Focus: system functions, interactions between subsystems. Used before detailed design exists.' },
  ],
};

/* ── Flashcards View ───────────────────────────────────────────── */
function FlashcardsView({ skillName, meta, pageIndex, onNext, onPrev, canGoNext, nextSkillName }: {
  skillName: string;
  meta: typeof skillMeta[string] | null;
  pageIndex: number;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  nextSkillName?: string;
}) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  // Reset flipped state when page changes
  useEffect(() => {
    setFlipped(new Set());
  }, [pageIndex]);

  function toggleFlip(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  // Check if custom content exists for this skill
  const customCards = customFlashcardContent[skillName];
  
  // 24 cards split into 3 pages of 8
  const allCards = customCards || [
    // ── Page 1: Core Concepts (8 cards) ──────────────────────
    { q: `What is ${skillName} and why does it matter?`, a: `${skillName} is a ${meta?.category || 'technical'} skill in the ${meta?.grouping || 'core'} domain. It matters because it forms the foundation for building reliable, efficient systems and is frequently tested in technical interviews.` },
    { q: `What problem does ${skillName} solve?`, a: `${skillName} addresses the challenge of ${meta?.grouping ? `working effectively within ${meta.grouping}` : 'solving complex engineering problems'}. Without it, engineers often resort to inefficient or error-prone approaches.` },
    { q: `What are the core principles behind ${skillName}?`, a: `The core principles include: understanding the underlying theory, recognizing common patterns, analyzing trade-offs, and applying the right tool for each context. Mastery comes from understanding "why", not just "how".` },
    { q: `How does ${skillName} fit into the broader ${meta?.grouping || 'engineering'} landscape?`, a: `${skillName} is part of the ${meta?.grouping || 'core'} grouping. It connects to adjacent skills and is often a prerequisite or co-requisite for more advanced topics in the same domain.` },
    { q: `What is the criticality of ${skillName}?`, a: `${meta?.criticality || 'Mandatory'} — ${meta?.criticality === 'Mandatory' ? 'This skill must be mastered. It appears in interviews, production systems, and is expected by employers.' : 'This skill gives you an extra edge. It differentiates strong candidates from average ones.'}` },
    { q: `What category does ${skillName} belong to?`, a: `${skillName} is categorized as ${meta?.category || 'Technical'}. This means it requires hands-on practice with real tools and code, not just theoretical understanding.` },
    { q: `What is the expected proficiency level for ${skillName}?`, a: `Focus on understanding the fundamentals and completing guided exercises. Build up to applying this skill independently in real projects and being able to explain your decisions clearly.` },
    { q: `What are the prerequisites for ${skillName}?`, a: `Prerequisites: ${meta?.prerequisites || 'None specified'}. Make sure you are comfortable with these before diving deep into ${skillName} to avoid gaps in understanding.` },

    // ── Page 2: Tools & Usage (8 cards) ──────────────────────
    { q: `What are the primary tools used in ${skillName}?`, a: `Primary tools: ${meta?.toolsets || 'Refer to course materials'}. Each tool has specific strengths — choose based on your project requirements, team standards, and performance needs.` },
    { q: `How do you set up a working environment for ${skillName}?`, a: `Start by installing the core tools: ${meta?.toolsets?.split('/')[0]?.trim() || 'the primary toolset'}. Follow the official documentation for setup, then validate with a simple "hello world" or baseline test.` },
    { q: `What is the most commonly used tool for ${skillName} in industry?`, a: `${meta?.toolsets?.split('/')[0]?.trim() || 'The primary tool'} is most widely used in industry for ${skillName}. It has the largest community, best documentation, and most job postings requiring it.` },
    { q: `When would you choose one tool over another for ${skillName}?`, a: `Tool selection depends on: team familiarity, project scale, performance requirements, licensing, and integration with existing systems. Always evaluate trade-offs before committing to a toolchain.` },
    { q: `How do you debug issues when working with ${skillName}?`, a: `Debugging approach: (1) Reproduce the issue consistently, (2) Isolate the failing component, (3) Check logs and error messages, (4) Use the debugger or print statements, (5) Consult documentation and community resources.` },
    { q: `What are common configuration mistakes when using tools for ${skillName}?`, a: `Common mistakes: incorrect environment setup, version mismatches, missing dependencies, wrong configuration file syntax, and not reading error messages carefully. Always check the official docs first.` },
    { q: `How do you validate that your ${skillName} implementation is correct?`, a: `Validation methods: write unit tests, compare output against known-good examples, use linters and static analysis tools, peer review, and test with edge cases including empty inputs and boundary values.` },
    { q: `What does a production-ready ${skillName} implementation look like?`, a: `Production-ready means: proper error handling, logging, monitoring, documentation, test coverage, performance benchmarks met, security considerations addressed, and code reviewed by peers.` },

    // ── Page 3: Real-World Application (8 cards) ─────────────
    { q: `Describe a real-world scenario where ${skillName} is applied.`, a: `In production systems, ${skillName} is applied when teams need to ensure ${meta?.grouping ? `${meta.grouping} quality` : 'system reliability'}. For example, during code reviews, system design, or incident response — this skill directly impacts outcomes.` },
    { q: `How does ${skillName} appear in technical interviews?`, a: `Interviewers test ${skillName} through: direct implementation questions, system design scenarios, debugging exercises, and "explain your approach" discussions. Expect both theoretical and practical questions.` },
    { q: `What trade-offs should you consider when applying ${skillName}?`, a: `Key trade-offs: performance vs. simplicity, flexibility vs. maintainability, speed of development vs. correctness, and short-term convenience vs. long-term technical debt. Always make trade-offs explicit.` },
    { q: `How does ${skillName} scale in large systems?`, a: `At scale, ${skillName} requires attention to: performance bottlenecks, distributed system concerns, monitoring and observability, graceful degradation, and team-wide consistency through standards and tooling.` },
    { q: `What are the most common mistakes engineers make when applying ${skillName}?`, a: `Top mistakes: over-engineering simple problems, under-engineering complex ones, ignoring edge cases, not testing, copying solutions without understanding them, and failing to document decisions.` },
    { q: `How do you explain ${skillName} to a junior engineer?`, a: `Start with the "why" — what problem does it solve? Then show a simple example. Build up complexity gradually. Encourage questions and hands-on practice. Avoid jargon until the fundamentals are clear.` },
    { q: `How does ${skillName} connect to other skills in your learning path?`, a: `${skillName} connects to: ${meta?.prerequisites ? `${meta.prerequisites} (prerequisite)` : 'foundational skills'} and enables more advanced topics in ${meta?.grouping || 'this domain'}. Building these connections accelerates your overall growth.` },
    { q: `What would you include in a code review checklist for ${skillName}?`, a: `Review checklist: correctness (does it work?), edge cases handled, tests written, performance acceptable, code readable and documented, no security issues, follows team conventions, and trade-offs are justified.` },
  ];

  const pageLabels = ['Core Concepts', 'Implementation', 'Applications'];
  const cardsPerPage = 8;
  const cards = allCards.slice(pageIndex * cardsPerPage, pageIndex * cardsPerPage + cardsPerPage);
  const globalOffset = pageIndex * cardsPerPage;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wider font-medium">Flashcards</p>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)] text-foreground">{skillName}</h1>
            <Badge variant="warning" className="text-[9px]">{pageLabels[pageIndex]}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((p) => (
              <span key={p} className={cn('h-1.5 rounded-full transition-all', p === pageIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30')} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">Set {pageIndex + 1} of 3</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onPrev} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" /> {pageIndex === 0 ? 'Back to Notes' : 'Prev Set'}
            </button>
            <button onClick={onNext} disabled={!canGoNext}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
              {pageIndex < 2 ? 'Next Set' : nextSkillName ? `Next: ${nextSkillName.split(' ').slice(0, 3).join(' ')}` : 'Done'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-xs text-muted-foreground mb-5">Click any card to reveal the answer</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {cards.map((card, i) => {
            const globalI = globalOffset + i;
            const isFlipped = flipped.has(globalI);
            return (
              <div key={globalI} onClick={() => toggleFlip(globalI)} className="cursor-pointer h-full">
                {/* Front */}
                {!isFlipped && (
                  <div className="rounded-xl border border-border bg-card p-5 flex flex-col hover:border-primary/40 hover:shadow-md transition-all h-full min-h-[180px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">{globalI + 1}</span>
                        <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-foreground">Question</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Tap to reveal</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed flex-1">{card.q}</p>
                  </div>
                )}
                {/* Back */}
                {isFlipped && (
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 flex flex-col h-full min-h-[180px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-w-green text-white text-[11px] font-bold shrink-0">{globalI + 1}</span>
                        <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-primary">Answer</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Tap to flip back</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1">{card.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Assessments View ──────────────────────────────────────────── */
function AssessmentsView({ skillName, meta, onNext, onPrev, canGoNext, nextSkillName }: {
  skillName: string;
  meta: typeof skillMeta[string] | null;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  nextSkillName?: string;
}) {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const isDone = answers.length === 5;

  const questions = [
    {
      topic: 'Fundamentals',
      q: `What is the primary purpose of ${skillName}?`,
      options: [
        `To provide a structured approach to ${meta?.grouping || 'engineering'} problems`,
        `To replace manual processes with automated ones`,
        `To ensure compliance with industry standards`,
        `To optimize memory usage in applications`,
      ],
      correct: 0,
    },
    {
      topic: 'Tools & Toolsets',
      q: `Which tool is most commonly associated with ${skillName} in production environments?`,
      options: [
        meta?.toolsets?.split('/')[1]?.trim() || 'Tool B',
        meta?.toolsets?.split('/')[0]?.trim() || 'Tool A',
        'Microsoft Excel',
        'Notepad++',
      ],
      correct: 1,
    },
    {
      topic: 'Application',
      q: `When applying ${skillName}, which approach is considered best practice?`,
      options: [
        'Skip documentation to save time',
        'Implement without testing first',
        'Understand trade-offs before choosing a solution',
        'Always use the newest available tool',
      ],
      correct: 2,
    },
    {
      topic: 'Criticality',
      q: `${skillName} is classified as "${meta?.criticality || 'Mandatory'}". What does this mean?`,
      options: [
        'It is optional and only for advanced learners',
        meta?.criticality === 'Mandatory'
          ? 'It must be mastered — expected in interviews and production systems'
          : 'It gives you an extra edge over other candidates',
        'It is only relevant for senior engineers',
        'It can be skipped if time is limited',
      ],
      correct: 1,
    },
    {
      topic: 'Integration',
      q: `How does ${skillName} connect to other skills in the ${meta?.grouping || 'engineering'} domain?`,
      options: [
        'It is completely independent with no dependencies',
        'It only connects to AI/ML skills',
        `It is a prerequisite or co-requisite for advanced topics in ${meta?.grouping || 'this domain'}`,
        'It replaces the need for other skills in the same grouping',
      ],
      correct: 2,
    },
  ];

  const q = questions[currentQ];
  const isAnswered = selectedOption !== null;
  const score = answers.filter((a) => a.correct).length;

  function handleSelect(oi: number) {
    if (isAnswered) return;
    setSelectedOption(oi);
  }

  function handleNext() {
    if (selectedOption === null) return;
    const newAnswers = [...answers, { selected: selectedOption, correct: selectedOption === q.correct }];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
    }
    // if last question, newAnswers.length === 5 → isDone becomes true
  }

  function handleBack() {
    if (currentQ === 0) {
      onPrev();
      return;
    }
    setAnswers(answers.slice(0, -1));
    setCurrentQ(currentQ - 1);
    setSelectedOption(answers[currentQ - 1]?.selected ?? null);
  }

  // ── Briefing screen ──────────────────────────────────────────
  if (!started) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
            <button onClick={onPrev} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back to Flashcards
            </button>
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="p-5 text-center pb-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
                  <ListChecks className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold font-[family-name:var(--font-heading)] text-xl">{skillName}</h3>
                <p className="text-sm text-muted-foreground mt-1">MCQ Assessment — Review before you begin</p>
              </div>
              <div className="p-5 pt-2 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Questions', value: '5' },
                    { label: 'Topic', value: meta?.grouping || 'General' },
                    { label: 'Category', value: meta?.category || 'Technical' },
                    { label: 'Difficulty', value: meta?.criticality === 'Mandatory' ? 'Core' : 'Extra Edge' },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-center">{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-border" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-w-orange" />
                    <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">Instructions</h3>
                  </div>
                  <ol className="space-y-2.5">
                    {[
                      'Answer each question before moving to the next.',
                      'Only one answer can be selected per question.',
                      'You can go back to the previous question.',
                      'Your score is shown immediately after submission.',
                      'There is no negative marking for incorrect answers.',
                    ].map((inst, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {inst}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="h-px bg-border" />
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStarted(true)}
                    className="inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold font-[family-name:var(--font-heading)] rounded-lg h-12 text-base hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" /> I'm Ready — Start Assessment
                  </button>
                  <button
                    onClick={onPrev}
                    className="inline-flex items-center justify-center gap-2 w-full border-2 border-primary text-primary bg-transparent font-semibold font-[family-name:var(--font-heading)] rounded-lg h-10 text-sm hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz + Results ───────────────────────────────────────────
  const progressPercent = ((currentQ + 1) / questions.length) * 100;
  const optionLabels = ['A', 'B', 'C', 'D'];
  const isLast = currentQ === questions.length - 1;
  const canGoNextQ = selectedOption !== null;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto">
        {!isDone ? (
          /* ── Active question — mocktest style ─────────────── */
          <div className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
            {/* Top bar: Q counter + timer */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-primary">
                Q {currentQ + 1}/{questions.length}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold font-[family-name:var(--font-heading)] text-muted-foreground">
                <Clock className="h-4 w-4" /> {Math.floor((questions.length - currentQ) * 60 / questions.length)}:{String(((questions.length - currentQ) * 60 % questions.length) * 2).padStart(2, '0')}
              </span>
            </div>

            {/* Progress bar */}
            <Progress value={progressPercent} indicatorColor="#5B4BDB" className="h-2" />

            {/* Question card */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="p-6">
                <p className="text-base font-semibold leading-relaxed mb-6">{q.q}</p>
                <div className="space-y-3">
                  {q.options.map((opt, oi) => {
                    const isSelected = selectedOption === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => handleSelect(oi)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/30 hover:bg-muted/50'
                        )}
                      >
                        <span className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          {optionLabels[oi]}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Previous / Next buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={currentQ === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold font-[family-name:var(--font-heading)] border-2 border-primary text-primary bg-transparent hover:bg-primary/5 h-10 px-5 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNextQ}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold font-[family-name:var(--font-heading)] bg-primary text-primary-foreground shadow-sm hover:opacity-90 h-10 px-5 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLast ? <><Send className="h-4 w-4" /> Submit</> : <>Next <ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        ) : (
          /* ── Results — mocktest style ─────────────────────── */
          <div className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
            {/* Score hero */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="h-6 w-6 text-w-amber" />
                  <h1 className="text-xl font-extrabold font-[family-name:var(--font-heading)]">Assessment Complete!</h1>
                </div>
                {/* Circular ring */}
                <div className="relative mx-auto h-[140px] w-[140px] mb-4">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="60" cy="60" r="48" fill="none"
                      stroke={score >= 4 ? '#88B033' : score >= 3 ? '#5B4BDB' : '#EF4444'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - score / questions.length)}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">{score}/{questions.length}</span>
                    <span className="text-sm font-bold text-muted-foreground">({Math.round(score / questions.length * 100)}%)</span>
                  </div>
                </div>
                <Badge variant={score >= 4 ? 'success' : score >= 3 ? 'default' : 'destructive'} className="text-sm px-4 py-1">
                  {score === 5 ? 'Perfect! 🎉' : score >= 3 ? 'Good Job!' : 'Keep Practicing'}
                </Badge>
              </div>
            </div>

            {/* Question review */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="p-5">
                <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] mb-4">Question Review</h3>
                <div className="space-y-4">
                  {questions.map((q, i) => {
                    const a = answers[i];
                    const correct = a?.correct;
                    return (
                      <div key={i}>
                        {i > 0 && <div className="h-px bg-border mb-4" />}
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {correct
                              ? <CheckCircle className="h-5 w-5 text-w-green shrink-0 mt-0.5" />
                              : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                            <p className="text-sm font-medium">{q.q}</p>
                          </div>
                          <div className="ml-7 space-y-1">
                            <p className={cn('text-xs font-semibold', correct ? 'text-w-green' : 'text-destructive')}>
                              Your answer: {a ? q.options[a.selected] : '—'}
                            </p>
                            {!correct && (
                              <p className="text-xs font-semibold text-w-green">
                                Correct answer: {q.options[q.correct]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={onNext}
              disabled={!canGoNext}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-3 rounded-xl cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {nextSkillName ? `Next Skill: ${nextSkillName.split(' ').slice(0, 3).join(' ')}` : 'Done'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Intro / Overview View ─────────────────────────────────────── */
function IntroView({ skillName, meta, chapters, totalLessons, completedLessons, onStart, onBack }: {
  skillName: string;
  meta: typeof skillMeta[string] | null;
  chapters: Chapter[];
  totalLessons: number;
  completedLessons: number;
  onStart: () => void;
  onBack: () => void;
}) {
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto px-6 sm:px-12 py-10" style={{ maxWidth: 920 }}>
      {/* ── Hero header ───────────────────────────────────────── */}
      <div className="mb-8">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Timeline
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              {meta && <Badge variant="info" className="text-[10px]">{meta.grouping}</Badge>}
              {meta && (
                <Badge variant={meta.criticality === 'Mandatory' ? 'destructive' : 'warning'} className="text-[10px]">
                  {meta.criticality}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-foreground mb-2">
              {skillName}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              Master the core concepts, patterns, and problem-solving techniques covered in this skill. Work through {totalLessons} lessons across {chapters.length} chapters at your own pace.
            </p>
          </div>

          <div className="shrink-0 hidden sm:block">
            <div className="w-28 h-28 relative">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={progressPct === 100 ? '#88B033' : '#5B4BDB'} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - progressPct / 100)}
                  transform="rotate(-90 60 60)" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-xl font-extrabold font-[family-name:var(--font-heading)]', progressPct === 100 ? 'text-w-green' : 'text-foreground')}>{progressPct}%</span>
                <span className="text-[9px] text-muted-foreground">complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar + stats row */}
        <div className="mt-5 flex items-center gap-4">
          <Progress value={progressPct} indicatorColor={progressPct === 100 ? '#88B033' : '#5B4BDB'} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground shrink-0">{completedLessons}/{totalLessons} lessons</span>
        </div>

        <div className="mt-4">
          <Button size="lg" onClick={onStart}>
            {completedLessons > 0 ? 'Continue Learning' : 'Start Learning'} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Metadata strip ────────────────────────────────────── */}
      {meta && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-px rounded-xl border border-border overflow-hidden mb-8">
          {[
            { icon: Layers, label: 'Grouping', val: meta.grouping },
            { icon: Timer, label: 'Duration', val: meta.duration },
            { icon: Wrench, label: 'Toolsets', val: meta.toolsets },
            { icon: ShieldCheck, label: 'Prerequisites', val: meta.prerequisites },
            { icon: Tag, label: 'Category', val: meta.category },
            { icon: AlertTriangle, label: 'Criticality', val: meta.criticality },
          ].map((item) => (
            <div key={item.label} className="bg-card px-4 py-3 flex flex-col items-center text-center">
              <item.icon className="h-4 w-4 text-muted-foreground mb-1.5" />
              <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
              <p className={cn(
                'text-xs font-bold font-[family-name:var(--font-heading)]',
                item.label === 'Criticality' && item.val === 'Mandatory' ? 'text-w-red' :
                item.label === 'Criticality' ? 'text-w-orange' : 'text-foreground'
              )}>{item.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Two-column: What you'll learn + Course outline ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* What you'll learn */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold font-[family-name:var(--font-heading)]">What you'll learn</h2>
          </div>
          <div className="space-y-2.5">
            {chapters.flatMap((ch) => ch.lessons.map((l) => l.title)).slice(0, 8).map((title, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle className="h-3.5 w-3.5 text-w-green shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80 leading-snug">{title}</span>
              </div>
            ))}
            {totalLessons > 8 && (
              <p className="text-xs text-muted-foreground mt-2 pl-6">+ {totalLessons - 8} more lessons</p>
            )}
          </div>
        </div>

        {/* Course outline */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold font-[family-name:var(--font-heading)]">Course Outline</h2>
          </div>
          <div className="space-y-2">
            {chapters.map((ch) => {
              const completed = ch.lessons.filter((l) => l.status === 'completed').length;
              const allDone = completed === ch.lessons.length;
              const chPct = ch.lessons.length > 0 ? Math.round((completed / ch.lessons.length) * 100) : 0;
              return (
                <div key={ch.id} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold shrink-0',
                      allDone ? 'bg-w-green/10 text-w-green' : 'bg-muted text-muted-foreground'
                    )}>
                      {allDone ? <CheckCircle className="h-3 w-3" /> : ch.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{ch.title}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{completed}/{ch.lessons.length}</span>
                  </div>
                  <Progress value={chPct} indicatorColor={allDone ? '#88B033' : '#5B4BDB'} className="h-1 ml-9" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */
export default function SkillLesson() {
  const { skillSlug } = useParams<{ skillSlug: string }>();
  const navigate = useNavigate();
  const { skills: planSkills, weeklySkills: planWeeklySkills } = usePlan();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'notes-1' | 'notes-2' | 'notes-3' | 'flashcards-1' | 'flashcards-2' | 'flashcards-3' | 'assessments-1'>('overview');
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set([skillSlug || '']));

  // Persist last visited skill + reset state on skill change
  useEffect(() => {
    if (skillSlug) {
      localStorage.setItem('last-skill-slug', skillSlug);
      setViewMode('overview');
      setExpandedSkills(new Set([skillSlug]));
    }
  }, [skillSlug]);
  const chapters = skillChapters[skillSlug || ''] || defaultChapters;

  // Find plan skill first so we can use it for name + meta
  const planSkill = planSkills.find((s) => s.slug === skillSlug);
  const skillName = skillNames[skillSlug || ''] || planSkill?.name || skillSlug?.replace(/-/g, ' ') || 'Skill';

  // Build meta: static map first, then plan skill data
  const meta = skillMeta[skillSlug || ''] || (planSkill ? {
    grouping: planSkill.grouping,
    duration: planSkill.proficiency === '1-Beginner' ? '~3h' : '~5h',
    toolsets: planSkill.toolsets,
    prerequisites: planSkill.prerequisite || 'None',
    category: planSkill.category,
    criticality: planSkill.criticality,
  } : null);

  // Track which skills are expanded in the sidebar (default: current skill open)
  const showIntro = viewMode === 'overview';
  const notePages = ['notes-1', 'notes-2', 'notes-3'] as const;
  const flashcardPages = ['flashcards-1', 'flashcards-2', 'flashcards-3'] as const;
  const notePageIndex = notePages.indexOf(viewMode as typeof notePages[number]);
  const flashcardPageIndex = flashcardPages.indexOf(viewMode as typeof flashcardPages[number]);
  const isOnNotes = notePageIndex >= 0;
  const isOnFlashcards = flashcardPageIndex >= 0;
  const isOnAssessments = viewMode === 'assessments-1';
  // Track which skills are expanded in the sidebar (default: current skill open)
  function toggleSkillExpand(slug: string) {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  // Find current skill's week and next skill (across weeks)
  const currentWeek = planWeeklySkills.find((w) => w.skills.some((s) => s.slug === skillSlug));
  const currentSkillIndexInWeek = currentWeek?.skills.findIndex((s) => s.slug === skillSlug) ?? -1;
  const nextSkillInWeek = currentWeek && currentSkillIndexInWeek < currentWeek.skills.length - 1
    ? currentWeek.skills[currentSkillIndexInWeek + 1]
    : null;

  // If last in week, find first skill of next week
  const allWeekSkills = planWeeklySkills.flatMap((w) => w.skills);
  const globalSkillIndex = allWeekSkills.findIndex((s) => s.slug === skillSlug);
  const nextSkill = nextSkillInWeek ?? (globalSkillIndex >= 0 && globalSkillIndex < allWeekSkills.length - 1
    ? allWeekSkills[globalSkillIndex + 1]
    : null);

  const prevSkillInWeek = currentWeek && currentSkillIndexInWeek > 0
    ? currentWeek.skills[currentSkillIndexInWeek - 1]
    : null;

  // Navigation logic
  function handleNext() {
    if (viewMode === 'overview') { setViewMode('notes-1'); return; }
    if (viewMode === 'notes-1') { setViewMode('notes-2'); return; }
    if (viewMode === 'notes-2') { setViewMode('notes-3'); return; }
    if (viewMode === 'notes-3') { setViewMode('flashcards-1'); return; }
    if (viewMode === 'flashcards-1') { setViewMode('flashcards-2'); return; }
    if (viewMode === 'flashcards-2') { setViewMode('flashcards-3'); return; }
    if (viewMode === 'flashcards-3') { setViewMode('assessments-1'); return; }
    if (viewMode === 'assessments-1') {
      if (nextSkill) {
        navigate(`/home/90-day-plan/revision/${nextSkill.slug}`);
      } else {
        navigate('/home/90-day-plan/milestone/revision');
      }
      return;
    }
  }

  function handlePrev() {
    if (viewMode === 'notes-1') { setViewMode('overview'); return; }
    if (viewMode === 'notes-2') { setViewMode('notes-1'); return; }
    if (viewMode === 'notes-3') { setViewMode('notes-2'); return; }
    if (viewMode === 'flashcards-1') { setViewMode('notes-3'); return; }
    if (viewMode === 'flashcards-2') { setViewMode('flashcards-1'); return; }
    if (viewMode === 'flashcards-3') { setViewMode('flashcards-2'); return; }
    if (viewMode === 'assessments-1') { setViewMode('flashcards-3'); return; }
    if (viewMode === 'overview' && prevSkillInWeek) {
      navigate(`/home/90-day-plan/revision/${prevSkillInWeek.slug}`);
    }
  }

  const canGoNext = true;
  const canGoPrev = viewMode !== 'overview' || !!prevSkillInWeek;

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ── LEFT PANEL — Timeline sidebar ─────────────────────── */}
      <div className="w-[280px] shrink-0 border-r border-border bg-card flex flex-col overflow-hidden max-md:hidden">
        {/* Header */}
        <Link to="/home/90-day-plan/milestone/revision" className="flex items-center gap-1.5 px-4 pt-3 pb-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-b border-border/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Timeline
        </Link>

        <div className="px-4 pb-2 pt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>

        <Separator />

        {/* Timeline skill list */}
        <div className="flex-1 overflow-y-auto">
          {planWeeklySkills.map((week) => (
            <div key={week.week}>
              {/* Week header */}
              <div className="px-4 py-1.5 bg-muted/30 border-b border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{week.label}</p>
              </div>

              {/* Skills in this week */}
              {week.skills
                .filter((s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((skill) => {
                  const isCurrentSkill = skill.slug === skillSlug;
                  const expanded = expandedSkills.has(skill.slug);

                  return (
                    <div
                      key={skill.slug}
                      ref={isCurrentSkill ? (el) => el?.scrollIntoView({ block: 'start', behavior: 'smooth' }) : undefined}
                    >
                      {/* Skill row */}
                      <div className={cn(
                        'flex items-center border-b border-border/40',
                        isCurrentSkill ? 'bg-primary/5' : ''
                      )}>
                        <Link
                          to={`/home/90-day-plan/revision/${skill.slug}`}
                          className={cn(
                            'flex-1 flex items-center gap-2 px-4 py-2.5 text-left transition-colors cursor-pointer min-w-0',
                            isCurrentSkill ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent hover:bg-muted/30'
                          )}
                        >
                          <span className={cn('text-xs font-semibold truncate', isCurrentSkill ? 'text-primary' : 'text-foreground')}>
                            {skill.name}
                          </span>
                        </Link>
                        <button
                          onClick={() => toggleSkillExpand(skill.slug)}
                          className="px-2 py-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>

                      {/* Sub-items: Notes, Flashcards, Assessments as simple links */}
                      {expanded && (
                        <div className="bg-muted/20 border-b border-border/40">
                          {[
                            { label: 'Notes', active: isCurrentSkill && isOnNotes, onClick: () => {
                              if (!isCurrentSkill) navigate(`/home/90-day-plan/revision/${skill.slug}`);
                              else setViewMode('notes-1');
                            }},
                            { label: 'Flashcards', active: isCurrentSkill && isOnFlashcards, onClick: () => {
                              if (!isCurrentSkill) navigate(`/home/90-day-plan/revision/${skill.slug}`);
                              else setViewMode('flashcards-1');
                            }},
                            { label: 'Assessments', active: isCurrentSkill && isOnAssessments, onClick: () => {
                              if (!isCurrentSkill) navigate(`/home/90-day-plan/revision/${skill.slug}`);
                              else setViewMode('assessments-1');
                            }},
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.onClick}
                              className={cn(
                                'w-full flex items-center gap-2 px-4 pl-8 py-2 text-xs transition-colors cursor-pointer',
                                item.active ? 'text-primary font-semibold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                              )}
                            >
                              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', item.active ? 'bg-primary' : 'bg-muted-foreground/40')} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <div
        ref={(el) => { if (el) el.scrollTop = 0; }}
        key={viewMode}
        className="flex-1 overflow-y-auto bg-background"
      >
        {showIntro ? (
          <IntroView
            skillName={skillName}
            meta={meta}
            chapters={chapters}
            totalLessons={9}
            completedLessons={0}
            onStart={() => setViewMode('notes-1')}
            onBack={() => navigate('/home/90-day-plan/milestone/revision')}
          />
        ) : isOnFlashcards ? (
          /* ── FLASHCARDS VIEW ──────────────────────────────── */
          <FlashcardsView
            skillName={skillName}
            meta={meta}
            pageIndex={flashcardPageIndex}
            onNext={handleNext}
            onPrev={handlePrev}
            canGoNext={canGoNext}
            nextSkillName={flashcardPageIndex < 2 ? undefined : 'Assessments'}
          />
        ) : isOnAssessments ? (
          /* ── ASSESSMENTS VIEW ─────────────────────────────── */
          <AssessmentsView
            skillName={skillName}
            meta={meta}
            onNext={handleNext}
            onPrev={handlePrev}
            canGoNext={canGoNext}
            nextSkillName={nextSkill?.name ?? 'Back to Timeline'}
          />
        ) : (
          /* ── NOTES VIEW (pages 1-3) ───────────────────────── */
          <div className="mx-auto px-4 sm:px-10 py-10" style={{ maxWidth: 1024 }}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-0 text-sm text-muted-foreground mb-6 flex-wrap">
              <Link to="/home" className="hover:text-primary transition-colors py-1">Home</Link>
              <span className="px-2.5 py-1 text-muted-foreground/60"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6.47 4-.94.94L8.584 8l-3.054 3.06.94.94L10.47 8 6.47 4Z" fill="currentColor" /></svg></span>
              <Link to="/home/90-day-plan" className="hover:text-primary transition-colors py-1">Slog Overs</Link>
              <span className="px-2.5 py-1 text-muted-foreground/60"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6.47 4-.94.94L8.584 8l-3.054 3.06.94.94L10.47 8 6.47 4Z" fill="currentColor" /></svg></span>
              <span className="text-foreground">{skillName}</span>
            </nav>

            {/* Page indicator */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="info" className="text-[10px]">Notes</Badge>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((p) => (
                    <button key={p} onClick={() => setViewMode(`notes-${p}` as typeof viewMode)}
                      className={cn('h-1.5 rounded-full transition-all cursor-pointer', notePageIndex + 1 === p ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30')} />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">Page {notePageIndex + 1} of 3</span>
              </div>
              {/* Top navigation buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={!canGoPrev} onClick={handlePrev}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!canGoNext} onClick={handleNext}>
                  {viewMode === 'notes-3' ? 'Go to Flashcards' : 'Next'} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-2.5 mt-2">
              <h1 className="text-[2rem] leading-tight font-bold font-[family-name:var(--font-heading)] tracking-tight text-foreground m-0">
                {skillName}
              </h1>
            </div>

            {/* Article body — different content per page */}
            <div className="mt-8">
              {getLessonArticle(
                notePageIndex === 0 ? skillName :
                notePageIndex === 1 ? `${skillName} — Implementation` :
                `${skillName} — Practice & Applications`,
                skillName
              )}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-border">
              <Button variant="outline" size="sm" disabled={!canGoPrev} onClick={handlePrev}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!canGoNext} onClick={handleNext}>
                {viewMode === 'notes-3' ? 'Go to Flashcards' : 'Next'} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
