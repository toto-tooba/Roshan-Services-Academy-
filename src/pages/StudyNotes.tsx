import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, ExternalLink, FileText, X, Navigation, Play, FileInput, LibrarySquare, ChevronRight, ChevronDown, Search, Info, Users, Upload, Trash2, Filter, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { gdPilotNotes as notes } from '../data/gdPilotNotes';

interface StudentNote {
  id: string;
  title: string;
  pdfUrl: string;
  category: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderPhoto?: string;
  uploaderRole?: string;
  createdAt: any;
}

const CATEGORIES = [
  { name: "GD (Pilot)", image: "https://i.postimg.cc/nhMMR8w9/Screenshot-2026-03-09-9-06-40-PM.png" },
  { name: "PMA long course", image: "https://i.postimg.cc/BQJcY63X/Screenshot-2026-03-09-8-10-50-PM.png" },
  { name: "PN CADET", image: "https://i.postimg.cc/4x6GJBMc/Screenshot-2026-03-09-8-14-49-PM.png" },
  { name: "AFNS", image: "https://i.postimg.cc/Bvw4ytk7/Screenshot-2026-03-09-8-16-57-PM.png" },
  { name: "ASF", image: "https://i.postimg.cc/3NfX0XcG/Screenshot-2026-03-09-8-20-28-PM.png" },
  { name: "Airmen", image: "https://i.postimg.cc/dQhmgXkf/Screenshot-2026-03-09-8-23-34-PM.png" },
  { name: "Sailor", image: "https://i.postimg.cc/Y0CVwxFs/Screenshot-2026-03-09-8-30-19-PM.png" },
  { name: "Pak Army Soldier", image: "https://i.postimg.cc/4xQSnM10/Screenshot-2026-03-09-8-34-40-PM.png" },
  { name: "Punjab Police", image: "https://i.postimg.cc/m2NwS9F4/Screenshot-2026-03-09-8-36-39-PM.png" },
  { name: "Rangers", image: "https://i.postimg.cc/NF2nMjNM/Screenshot-2026-03-09-8-46-17-PM.png" },
  { name: "LAT", image: "https://i.postimg.cc/SQVL2404/Screenshot-2026-03-09-8-53-48-PM.png" },
  { name: "MDCAT", image: "https://i.postimg.cc/vB0zswbW/Screenshot-2026-03-09-9-00-43-PM.png" },
  { name: "E-CAT", image: "https://i.postimg.cc/T2mV0bWr/Screenshot-2026-03-09-9-04-06-PM.png" },
  { name: "ANF", image: "https://i.postimg.cc/SK2pwctx/quetta-balochistan-pakistan-the-anti-narcotics-force-burned-drugs-in-a-destruction-action-in.webp" }
];

const SUB_CATEGORIES = [
  { id: 'pdf_notes', title: 'PDF Notes', icon: FileText, desc: 'Downloadable study materials' },
  { id: 'student_notes', title: 'Student Notes', icon: Users, desc: 'Notes contributed by students & admins' },
  { id: 'live_quizzes', title: 'Live Quizzes', icon: Play, desc: 'Interactive practice tests' },
  { id: 'related_books_and_notes', title: 'Related books and Notes', icon: LibrarySquare, desc: 'More Books, Notes and Past papers' },
];

const GD_PILOT_QUIZZES = [
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Verbal Intelligence", desc: "Logic & Reasoning", path: "/practice-test/verbal/test" },
  { title: "Physics Class 9th", desc: "Core Concepts", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Advanced Principles", path: "/practice-test/physics/10" },
  { title: "Physics Class 11th", desc: "Higher Physics I", path: "/practice-test/physics/11" },
  { title: "Physics Class 12th", desc: "Higher Physics II", path: "/practice-test/physics/12" },
  { title: "Mathematics Class 9th", desc: "Algebra & Geometry", path: "/practice-test/mathematics/9" },
  { title: "Mathematics Class 10th", desc: "Trigonometry & Theorems", path: "/practice-test/mathematics/10" },
  { title: "Mathematics Class 11th", desc: "Advanced Math I", path: "/practice-test/mathematics/11" },
  { title: "Mathematics Class 12th", desc: "Calculus & Algebra", path: "/practice-test/mathematics/12" },
];

const GD_PILOT_RELATED_BOOKS = [
  { title: "100 Physics Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/100-Physics-Questions.pdf" },
  { title: "FSc Part-1 Maths MCQs", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/FSc%20Part-1%20maths%20mcqs.pdf" },
  { title: "FSc Part-2 Maths MCQs", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/FSc%20part-2%20maths%20mcqs.pdf" },
  { title: "Maths Int. for Commissioned Officers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/maths%20intermediate%20for%20commissioned%20officers.pdf" },
  { title: "Non Verbal Intelligence 4", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Non%20verbal%20(4).pdf" },
  { title: "Non Verbal Intelligence 7", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Non%20verbal%20(7).pdf" },
  { title: "PAF GD-P Book 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PAF-GD-P-Book1.pdf" },
  { title: "Super Intelligence Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Super%20Intelligence%20Book%20by%20Nazam%20Sattar%20Khokhar.pdf" },
  { title: "Verbal Intelligence Test 5", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Verbal%20Intelligence%20Test5.pdf" },
  { title: "Verbal Intelligence Tests Online", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/verbal-intelligence-tests-online.pdf" },
  { title: "Dogars Test Masters for PAF GDP AD A SD", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/696878055-Dogars-Test-Masters-for-PAF-GDP-AD-A-SD.pdf" }
];

const PMA_LONG_COURSE_RELATED_BOOKS = [
  { title: "PMA Long Course Preparation Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/530887550-PMA-Long-Course-Preparation-Book-by-Urdu-Books-Group-1-Copy.pdf" },
  { title: "PMA Long Course", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20long%20Course.pdf" },
  { title: "PMA Maths 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Maths%202.pdf" },
  { title: "PMA Maths Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Maths%20Notes.pdf" },
  { title: "PMA Verbal Intelligence 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Verbal%20intelligence%202.pdf" },
  { title: "PMA Verbal Intelligence", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Verbal%20intelligence.pdf" },
  { title: "Super Intelligence Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Super%20Intelligence%20Book%20by%20Nazam%20Sattar%20Khokhar.pdf" }
];

const AFNS_RELATED_BOOKS = [
  { title: "AFNS Experience 24-Aug-2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/afns-experience-24-Aug-2020.pdf" },
  { title: "AFNS Notes 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Afns-Notes-1-1.pdf" },
  { title: "AFNS Notes 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Afns-Notes-2-2.pdf" },
  { title: "AFNS Notes 4", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Afns-Notes-4.pdf" },
  { title: "Physics AFNS Past Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Physics-AFNS-Past-Papers-1.pdf" }
];

const ASF_RELATED_BOOKS = [
  { title: "ASF (ASI) Urdu Dogar Unique 2022-2023", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF/ASF%20(ASI)%20Urdu%20Dogar%20Unique%202022-2023.pdf" },
  { title: "ASF Corporal Guide BPS 07 Caravan", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF/ASF%20Corporal%20Guide%20BPS%2007%20Caravan.pdf" },
  { title: "ASF Past Paper ASI Corporal", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF/ASF-Past-Paper-ASI-Corporal.pdf" },
  { title: "ASF Everyday Science", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF%20EVERYDAY%20SCIENCE.pdf" }
];

const ANF_RELATED_BOOKS = [
  { title: "ANF Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/Today%20Paper%20of%20Sub-Inspector%20ANF%20held%20on%2031-01-2021.pdf" },
  { title: "Past paper 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20ASI%20and%20SI%20Past%20Papers%20important%20for%20Next%20Upcoming%20Tests.pdf" },
  { title: "Past paper 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Constable%20ASI%20and%20Sub%20Inspector%20Past%20Papers%20important%20for%20Next%20Upcoming%20Tests.pdf" },
  { title: "Past paper 3", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20MCQS%20-1%20(1).pdf" },
  { title: "Past paper 4", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v1.pdf" },
  { title: "Past paper 5", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v2.pdf" },
  { title: "Past paper 6", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v3.pdf" },
  { title: "Past paper 7", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v4.pdf" },
  { title: "Past paper 8", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v5.pdf" },
  { title: "Past paper 9", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v5.pdf" },
  { title: "Past paper 10", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/Today%20Paper%20of%20Sub-Inspector%20ANF%20held%20on%2031-01-2021.pdf" }
];

const ECAT_RELATED_BOOKS = [
  { title: "ECAT Past Paper 2010", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202010.pdf" },
  { title: "ECAT Past Paper 2011", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202011.pdf" },
  { title: "ECAT Past Paper 2012", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202012.pdf" },
  { title: "ECAT Past Paper 2014-1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202014-1.pdf" },
  { title: "ECAT Past Paper 2014", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202014.pdf" },
  { title: "ECAT Past Paper 2015", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202015.pdf" },
  { title: "ECAT Past Paper 2016", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202016.pdf" },
  { title: "ECAT Past Paper 2017", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202017.pdf" },
  { title: "ECAT 2011-2012", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT-2011-2012.pdf" },
  { title: "ECAT 2011", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT-2011.pdf" },
  { title: "Ecat 2013", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/Ecat-2013.pdf" },
  { title: "Ecat 2015", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/Ecat-2015.pdf" },
  { title: "UET Lahore ECAT Entrance Test 2019 Mathematics", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/UET-Lahore-ECAT-Entrance-Test-2019-Mathematics.pdf" },
  { title: "Dogars ECAT Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/Dogars%20ECAT%20Book-compressed.pdf" }
];

const MDCAT_RELATED_BOOKS = [
  { title: "UHS MDCAT 2024 Original Paper with Answer Key", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2455-UHS%20MDCAT%202024%20Original%20Paper%20with%20Answer%20Key%20PDF-by-Admin-(taleem360.com).pdf" },
  { title: "KMU MDCAT Paper 2024 PDF with Answers Key (Code A)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2456-KMU%20MDCAT%20Paper%202024%20PDF%20with%20Answers%20Key%20(Code%20A)-by-Admin-(taleem360.com).pdf" },
  { title: "KMU MDCAT 2024 Original Paper PDF with Answers (Code B)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2457-KMU%20MDCAT%202024%20Original%20Paper%20PDF%20with%20Answers%20(Code%20B)-by-Admin-(taleem360.com).pdf" },
  { title: "DUHS Sindh MDCAT 2024 Paper PDF", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2467-DUHS%20Sindh%20MDCAT%202024%20Paper%20PDF%20by%20SKN-by-Admin-(taleem360.com).pdf" },
  { title: "KIPS KDP Logical Reasoning MDCAT 2025 Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2549-KIPS%20KDP%20Logical%20Reasoning%20MDCAT%202025%20Book%20PDF-(taleem360.com).pdf" },
  { title: "Torcia MDCAT Chemistry Preparation Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2551-Torcia%20MDCAT%20Chemistry%20Preparation%20Book%20PDF-(taleem360.com).pdf" },
  { title: "KIPS KDP MDCAT English Grammar Practice Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2552-KIPS%20KDP%20MDCAT%20English%20Grammar%20Practice%20Book%20PDF-(taleem360.com).pdf" },
  { title: "UHS MDCAT 2025 Original Paper with Answer Key", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2764-UHS%20MDCAT%202025%20Original%20Paper%20with%20Answer%20Key%20PDF-(taleem360.com).pdf" },
  { title: "KMU MDCAT 2025 Paper PDF with Answer Key", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2765-KMU%20MDCAT%202025%20Paper%20PDF%20with%20Answer%20Key-(taleem360.com).pdf" },
  { title: "SZABMU MDCAT 2025 Paper PDF with Answer Key", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2767-SZABMU%20MDCAT%202025%20Paper%20PDF%20with%20Answer%20Key-(taleem360.com).pdf" },
  { title: "MDCAT 2017 Reconduct", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202017%20Reconduct.pdf" },
  { title: "MDCAT 2017", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202017.pdf" },
  { title: "MDCAT 2018-1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202018-1.pdf" },
  { title: "MDCAT 2018", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202018.pdf" },
  { title: "MDCAT Biology Preparation Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%20Biology%20preparation%20Book.pdf" },
  { title: "MDCAT Physics Preparation Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%20Physics%20Preparation%20Book.pdf" },
  { title: "MDCAT Unit Wise (2011-16)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%20Unit%20Wise%20(2011-16).pdf" },
  { title: "UHS MDCAT 2023 Paper D with Answer Key", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/UHS%20MDCAT%202023%20Paper%20D%20with%20Answer%20Key%20(taleem360.com).pdf" },
  { title: "MDCAT Important Note 1", url: "https://drive.google.com/file/d/1wd--u1xNAI8k8LYmfLYRghC-HJDCcbyD/view?usp=sharing" },
  { title: "MDCAT Important Note 2", url: "https://drive.google.com/file/d/1eYtOLqEXWqAciE8L2CCjGUOI4w8yuMWO/view?usp=sharing" },
  { title: "MDCAT Important Note 3", url: "https://drive.google.com/file/d/1SUV233NRIeD1xZTT0f7KI_JSTxIpan9v/view?usp=sharing" },
  { title: "MDCAT Logical Reasoning Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT%20Logical%20Reasoning%20Questions.pdf" }
];

const LAT_RELATED_BOOKS = [
  { title: "LAT Past Paper 12 November 2023", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/2350-LAT%20Past%20Paper%2012%20November%202023%20PDF%20(Feedback%20MCQs)-by-Admin-(taleem360.com).pdf" },
  { title: "LAT Past Paper PDF (04 February 2024)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/2584-LAT%20Past%20Paper%20PDF%20(04%20February%202024)-(taleem360.com).pdf" },
  { title: "Law Admission Test LAT Preparation Book by Sir Omar", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/2793-Law%20Admission%20Test%20LAT%20Preparation%20Book%20by%20Sir%20Omar-(taleem360.com).pdf" },
  { title: "LAT Past Paper 03 October 2021", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2003%20October%202021.pdf" },
  { title: "LAT Past Paper 16 July 2023 v1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2016%20July%202023%20(taleem360.com)%20(1).pdf" },
  { title: "LAT Past Paper 16 July 2023", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2016%20July%202023%20(taleem360.com).pdf" },
  { title: "LAT Past Paper 21 AUGUST 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2021%20AUGUST%202022.pdf" },
  { title: "LAT Past Paper 22 May 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2022%20May%202022.pdf" },
  { title: "LAT Past Paper 28 November 2021", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2028%20November%202021.pdf" },
  { title: "LAT Past Paper 30 January 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2030%20January%202022.pdf" },
  { title: "LAT Past Paper Morning", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%20Morning.pdf" },
  { title: "LAT Past Paper September 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%20september%202020%20Website%20Copy.pdf" },
  { title: "LAT Past Papers PDF Download", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/lat%20test%20past%20papers%20pdf%20download.pdf" },
  { title: "Lat", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/Lat.pdf" },
  { title: "Law Admission Test 2020 December", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/Law%20Admission%20Test%202020%20December.pdf" },
  { title: "Law Admission Test 22 Jan 2023", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/Law%20Admission%20Test%2022%20Jan%202023.pdf" },
  { title: "Most Common LAT Essay Topics", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Most%20Common%20LAT%20Essay%20Topics.pdf" },
  { title: "LAT Personal Statements", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT%20Personal%20Statements.pdf" }
];

const RANGERS_RELATED_BOOKS = [
  { title: "105 Islamiat Solved Questions Important", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/105%20Islamiat%20Solved%20Questions%20Important.pdf" },
  { title: "FIRST IN PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/FIRST%20IN%20PAKISTAN.docx-converted.pdf" },
  { title: "G.K ABOUT PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/G.K%20ABOUT%20PAKISTAN.pdf" },
  { title: "GEOGRAPHY OF PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/GEOGRAPHY%20OF%20PAKISTAN-converted.pdf" },
  { title: "Important Pakistan Studies Quizzes Solved Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Important%20Pakistan%20Studies%20Quizzes%20Solved%20Questions%20.pdf" },
  { title: "Pakistan Study Questions important for All Tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Pakistan%20Study%20Questions%20important%20for%20All%20Tests.pdf" },
  { title: "Ranger Solved Past Paper held on 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Ranger%20Solved%20Past%20Paper%20held%20on%202020.pdf" },
  { title: "Rangers Solved Past Paper Pdf", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Rangers%20Solved%20Past%20Paper%20Pdf.pdf" },
  { title: "Very Important GK Past Papers Solved Questions for All Types of Tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Very%20Important%20GK%20Past%20Papers%20Solved%20Questions%20for%20All%20Types%20of%20Tests.pdf" },
  { title: "world intelligence agencies", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/world%20intelligence%20agencies.jpg" }
];

const PUNJAB_POLICE_RELATED_BOOKS = [
  { title: "FIA Constable paper 2019", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/FIA%20Constable%20paper%202019%20download%20from%20www-doc4shares-com.pdf" },
  { title: "FIRST IN PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/FIRST%20IN%20PAKISTAN.docx-converted-1.pdf" },
  { title: "ICT Islamabad Police Constable Solved Past Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/ICT%20Islamabad%20Police%20Constable%20Solved%20Past%20Papers%20held%20on%2031-12-2022.pdf" },
  { title: "Important Pak Study Solved Mcqs", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Important%20Pak%20Study%20Solved%20Mcqs%20for%20Police%20Constable%20Test.pdf" },
  { title: "Important Pakistan Studies Quizzes Solved Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Important%20Pakistan%20Studies%20Quizzes%20Solved%20Questions%20-1.pdf" },
  { title: "Khulfa-e-rashedin and ashra mubashra", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Khulfa-e-rashedin%20and%20ashra%20mubashra%20islamic%20information.pdf" },
  { title: "Pakistan Study Questions important for All Tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Pakistan%20Study%20Questions%20important%20for%20All%20Tests-2.pdf" },
  { title: "Police Constable Past Paper 2024", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Police%20Constable%20Past%20Paper%20held%20in%202024.pdf" },
  { title: "Police Constable Past Paper 15-10-23", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Police%20Constable%20Past%20Paper%20held%20on%2015-10-23.pdf" },
  { title: "Police Officers Ranks and Its Symbols", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Police%20Officers%20Ranks%20and%20Its%20Symbols%20Very%20Important.pdf" },
  { title: "POLICE BOOK", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/POLICE_BOOK-doc4shares-com.pdf" },
  { title: "Punjab Police Test 05-03-2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Punjab%20Police%20Test%2005-03-2022.pdf" },
  { title: "Punjab Police Traffic Assistant/Constable Past Paper 2024", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Punjab%20Police%20Traffic%20Assistant,%20Constable,%20Lady%20Constable,%20Driver%20Past%20Paper%20held%20on%2022%20March%202024.pdf" },
  { title: "Traffic Police Constable Past Paper 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Traffic%20Police%20Constable%20Past%20Paper%20held%20on%202020.pdf" },
  { title: "Very Important GK Past Papers Solved Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Very%20Important%20GK%20Past%20Papers%20Solved%20Questions%20for%20All%20Types%20of%20Tests-1.pdf" }
];

const PAK_ARMY_SOLDIER_RELATED_BOOKS = [
  { title: "Pak Army Soldier Guide", url: "https://drive.google.com/file/d/1BfOvqyt5fKdU4NfL4hHXw-eYjdIOqp0X/view?usp=sharing" },
  { title: "FIRST IN PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/FIRST%20IN%20PAKISTAN.docx-converted-2.pdf" },
  { title: "GEOGRAPHY OF PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/GEOGRAPHY%20OF%20PAKISTAN-converted-1.pdf" },
  { title: "Intelligence Solved Mcqs Exercise", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Intelligence%20Solved%20Mcqs%20Exercise%20for%20PAF,%20Navy,%20Army,%20Commission%20Tests.pdf" },
  { title: "Non verbal (3)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Non%20verbal%20(3).pdf" },
  { title: "Non verbal (6)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Non%20verbal%20(6).pdf" },
  { title: "Pakistan Study Questions important for All Tests 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Pakistan%20Study%20Questions%20important%20for%20All%20Tests-3.pdf" },
  { title: "Verbal Intelligence test 3", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Verbal%20Intelligence%20test3.pdf" },
  { title: "VERBAL PAF, NAVY, ARMY, PMA", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/VERBAL%20PAF,%20NAVY,%20ARMY,%20PMA.pdf" },
  { title: "Pakistan Study Questions important for All Tests 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Pakistan%20Study%20Questions%20important%20for%20All%20Tests-4.pdf" }
];

const SAILOR_RELATED_BOOKS = [
  { title: "FIRST IN PAKISTAN v1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/FIRST%20IN%20PAKISTAN.docx-converted-2.pdf" },
  { title: "FIRST IN PAKISTAN v2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/FIRST%20IN%20PAKISTAN.docx-converted-3.pdf" },
  { title: "GEOGRAPHY OF PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/GEOGRAPHY%20OF%20PAKISTAN-converted-1.pdf" },
  { title: "Important Pakistan Studies Quizzes Solved Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/Important%20Pakistan%20Studies%20Quizzes%20Solved%20Questions%20-2.pdf" },
  { title: "Intelligence Solved Mcqs Exercise", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/Intelligence%20Solved%20Mcqs%20Exercise%20for%20PAF,%20Navy,%20Army,%20Commission%20Tests-2.pdf" },
  { title: "P.Navy Sailors Guide for tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/P.Navy%20Sailors%20Guide%20for%20tests.pdf" },
  { title: "PAF Test Preparation Books", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/PAF%20Test%20Preparation%20Books%20By%20Jobs%20Test%20Preparation.pdf" },
  { title: "Pakistan Study Questions important for All Tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/Pakistan%20Study%20Questions%20important%20for%20All%20Tests-4.pdf" }
];

const PN_CADET_RELATED_BOOKS = [
  { title: "Book for verbal and non verbal intelligence", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Book%20for%20verbal%20and%20non%20verbal%20intelligence.pdf" },
  { title: "Pak Navy initial tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Pak%20Navy%20initial%20tests.pdf" },
  { title: "Pak Navy Sailors Notes of English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Pak%20Navy%20Sailors%20Notes%20of%20English.pdf" },
  { title: "Pak-NAVY-Past-Papers-MCQs-Quiz-Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Pak-NAVY-Past-Papers-MCQs-Quiz-Test.pdf" },
  { title: "Who is who and what is what by Dogar Brothers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Who%20is%20who%20and%20waht%20is%20what%20by%20Dogar%20Brothers.pdf" }
];


const PMA_LONG_COURSE_QUIZZES = [
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Basic Maths", desc: "Quantitative Assessment", path: "/practice-test/basic-math/test" },
  { title: "Pakistan Studies", desc: "History & Geography", path: "/practice-test/pak-studies/test" },
  { title: "Islamic Studies", desc: "Religious Knowledge", path: "/practice-test/islamic/test" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
  { title: "Verbal Intelligence", desc: "Logic & Reasoning", path: "/practice-test/verbal/test" },
];

const PMA_LONG_COURSE_NOTES = [
  { title: "Nonverbal intelligence test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf" },
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf" },
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "Islamiyat", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Islamic%20Studies%20Notes.pdf" },
  { title: "Pakistan Studies", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pakistan%20Studies%20Notes.pdf" },
  { title: "Basic Maths", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf" }
];

const ASF_NOTES = [
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Pakistan Studies", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pakistan%20Studies%20Notes.pdf" },
  { title: "Islamiyat", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Islamic%20Studies%20Notes.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "ASF Everyday Science", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF%20EVERYDAY%20SCIENCE.pdf" }
];

const AIRMEN_NOTES = [
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Mathematics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%209th%20Notes.pdf" },
  { title: "Mathematics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf" },
  { title: "Non-Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf" },
];

const SAILOR_NOTES = [
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Mathematics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%209th%20Notes.pdf" },
  { title: "Mathematics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
];

const AIRMEN_RELATED_BOOKS = [
  { title: "Complete English Prepositions Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/5-Complete-English-Prepositions-Book.pdf" },
  { title: "G.K ABOUT PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/G.K%20ABOUT%20PAKISTAN-1.pdf" },
  { title: "GEOGRAPHY OF PAKISTAN", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/GEOGRAPHY%20OF%20PAKISTAN-converted-2.pdf" },
  { title: "Important Pakistan Studies Quizzes Solved Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Important%20Pakistan%20Studies%20Quizzes%20Solved%20Questions%20-3.pdf" },
  { title: "Interview Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Interview%20Notes%20by%20doc4shares-com.pdf" },
  { title: "Non verbal (7)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Non%20verbal%20(7)%20(1).pdf" },
  { title: "Non-Verbal Intelligence by Khokhar brothers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Non-Verbal-Intelligence-by-Khokhar-brothers.pdf" },
  { title: "PAF Airman Guide", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/PAF%20Airman%20Guide%20by%20www-doc4shares-com.pdf" },
  { title: "PAF Test Preparation Books", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/PAF%20Test%20Preparation%20Books%20By%20Jobs%20Test%20Preparation.pdf" },
  { title: "Pakistan Study Questions important for All Tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Pakistan%20Study%20Questions%20important%20for%20All%20Tests-5.pdf" },
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Verbal%20Intelligence%20Test.pdf" },
  { title: "verbal intelligence test 13", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/verbal%20intelligence%20test13%20(1).pdf" }
];

const PAK_ARMY_SOLDIER_NOTES = [
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf" },
  { title: "Non-Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
];

const PUNJAB_POLICE_NOTES = [
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Urdu", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Urdu%20Grammer%20Notes.pdf" },
  { title: "Basic Math", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf" },
];

const RANGERS_NOTES = [
  { title: "Basic Math", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Urdu", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Urdu%20Grammer%20Notes.pdf" },
];

const LAT_NOTES = [
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "Islamiyat", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Islamic%20Studies%20Notes.pdf" },
  { title: "Pak Studies", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pakistan%20Studies%20Notes.pdf" },
  { title: "Urdu", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Urdu%20Grammer%20Notes.pdf" },
  { title: "Basic Math", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf" },
  { title: "Most Common LAT Essay Topics", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Most%20Common%20LAT%20Essay%20Topics.pdf" },
  { title: "LAT Personal Statements", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT%20Personal%20Statements.pdf" }
];

const MDCAT_NOTES = [
  { title: "Biology Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Class%209th%20Mcqs%20Notes.pdf" },
  { title: "Biology Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Mcqs%20Class%2010th.pdf" },
  { title: "Biology Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2011th%20Notes%20(1).pdf" },
  { title: "Biology Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Class%2012th%20Notes.pdf" },
  { title: "Chemistry Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%209th%20Class%20Notes.pdf" },
  { title: "Chemistry Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2010th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2011th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2012th%20Notes.pdf" },
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2011th%20Notes.pdf" },
  { title: "Physics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2012th%20notes.pdf" },
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "MDCAT Logical Reasoning Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT%20Logical%20Reasoning%20Questions.pdf" }
];

const E_CAT_NOTES = [
  { title: "Mathematics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%209th%20Notes.pdf" },
  { title: "Mathematics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Mathematics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2011th%20Notes.pdf" },
  { title: "Mathematics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2012th%20Notes.pdf" },
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2011th%20Notes.pdf" },
  { title: "Physics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2012th%20notes.pdf" },
  { title: "Chemistry Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%209th%20Class%20Notes.pdf" },
  { title: "Chemistry Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2010th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2011th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2012th%20Notes.pdf" },
  { title: "Computer Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%209th%20Notes.pdf" },
  { title: "Computer Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%2010th%20Notes.pdf" },
  { title: "Computer Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%2011th%20Notes.pdf" },
  { title: "Computer Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%2012th%20Notes.pdf" },
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
];

const ANF_SUB_INSPECTOR_NOTES: any[] = [];
const ANF_SUB_INSPECTOR_QUIZZES: any[] = [
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Pakistan Studies", desc: "History & Geography", path: "/practice-test/pak-studies/test" },
  { title: "Islamic Studies", desc: "Religious Knowledge", path: "/practice-test/islamic/test" }
];

const AFNS_NOTES = [
  { title: "Biology Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Class%209th%20Mcqs%20Notes.pdf" },
  { title: "Biology Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Mcqs%20Class%2010th.pdf" },
  { title: "Biology Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%2011th%20Class.pdf" },
  { title: "Biology Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Class%2012th%20Notes.pdf" },
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2011th%20Notes.pdf" },
  { title: "Physics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2012th%20notes.pdf" },
  { title: "Chemistry Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%209th%20Class%20Notes.pdf" },
  { title: "Chemistry Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2010th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2011th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2012th%20Notes.pdf" },
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf" },
  { title: "Non-Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf" },
];

const PN_CADET_NOTES = [
  { title: "English", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "Mathematics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%209th%20Notes.pdf" },
  { title: "Mathematics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2010th%20Notes.pdf" },
  { title: "Mathematics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2011th%20Notes.pdf" },
  { title: "Mathematics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2012th%20Notes.pdf" },
  { title: "Basic Mathematics", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf" },
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2011th%20Notes.pdf" },
  { title: "Physics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2012th%20notes.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf" },
  { title: "Non-Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf" },
  { title: "Pakistan Studies", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pakistan%20Studies%20Notes.pdf" },
];

const PN_CADET_QUIZZES = [
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Mathematics Class 9th", desc: "Algebra & Geometry", path: "/practice-test/mathematics/9" },
  { title: "Mathematics Class 10th", desc: "Trigonometry & Theorems", path: "/practice-test/mathematics/10" },
  { title: "Mathematics Class 11th", desc: "Advanced Math I", path: "/practice-test/mathematics/11" },
  { title: "Mathematics Class 12th", desc: "Calculus & Algebra", path: "/practice-test/mathematics/12" },
  { title: "Basic Maths", desc: "Quantitative Assessment", path: "/practice-test/basic-math/test" },
  { title: "Physics Class 9th", desc: "Core Concepts", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Advanced Principles", path: "/practice-test/physics/10" },
  { title: "Physics Class 11th", desc: "Higher Physics I", path: "/practice-test/physics/11" },
  { title: "Physics Class 12th", desc: "Higher Physics II", path: "/practice-test/physics/12" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
  { title: "Verbal Intelligence", desc: "Logic & Reasoning", path: "/practice-test/verbal/test" },
  { title: "Pakistan Studies", desc: "History & Geography", path: "/practice-test/pak-studies/test" },
];

const AFNS_QUIZZES = [
  { title: "Biology Class 9th", desc: "Core Principles of Biology", path: "/practice-test/biology/9" },
  { title: "Biology Class 10th", desc: "Advanced Life Sciences", path: "/practice-test/biology/10" },
  { title: "Biology Class 11th", desc: "Higher Biology I", path: "/practice-test/biology/11" },
  { title: "Biology Class 12th", desc: "Higher Biology II", path: "/practice-test/biology/12" },
  { title: "Physics Class 9th", desc: "Core Concepts", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Advanced Principles", path: "/practice-test/physics/10" },
  { title: "Physics Class 11th", desc: "Higher Physics I", path: "/practice-test/physics/11" },
  { title: "Physics Class 12th", desc: "Higher Physics II", path: "/practice-test/physics/12" },
  { title: "Chemistry Class 9th", desc: "Fundamental Chemistry", path: "/practice-test/chemistry/9" },
  { title: "Chemistry Class 10th", desc: "Chemical Reactions", path: "/practice-test/chemistry/10" },
  { title: "Chemistry Class 11th", desc: "Higher Chemistry I", path: "/practice-test/chemistry/11" },
  { title: "Chemistry Class 12th", desc: "Higher Chemistry II", path: "/practice-test/chemistry/12" },
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Verbal Intelligence", desc: "Logic & Reasoning", path: "/practice-test/verbal/test" },
  { title: "Non-Verbal Intelligence Test", desc: "Visual Reasoning", path: "/practice-test/non-verbal/test" },
];

const ASF_QUIZZES = [
  { title: "Everyday Science (Live)", desc: "25 New questions from Roshan Services Academy", path: "/practice-test/asf-science/test" },
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Pakistan Studies", desc: "History & Geography", path: "/practice-test/pak-studies/test" },
  { title: "Islamic Studies", desc: "Religious Knowledge", path: "/practice-test/islamic/test" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
];

const AIRMEN_QUIZZES = [
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Mathematics Class 9th", desc: "Algebra & Geometry", path: "/practice-test/mathematics/9" },
  { title: "Mathematics Class 10th", desc: "Trigonometry & Theorems", path: "/practice-test/mathematics/10" },
  { title: "Physics Class 9th", desc: "Core Concepts", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Advanced Principles", path: "/practice-test/physics/10" },
  { title: "Verbal Intelligence", desc: "Logic & Reasoning", path: "/practice-test/verbal/test" },
  { title: "Non-Verbal Intelligence Test", desc: "Visual Reasoning", path: "/practice-test/non-verbal/test" },
];

const SAILER_QUIZZES = [
  { title: "English Practice", desc: "Comprehensive Grammar Module", path: "/practice-test/english/notes" },
  { title: "Mathematics Class 9th", desc: "Algebra & Geometry", path: "/practice-test/mathematics/9" },
  { title: "Mathematics Class 10th", desc: "Trigonometry & Theorems", path: "/practice-test/mathematics/10" },
  { title: "Physics Class 9th", desc: "Core Concepts", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Advanced Principles", path: "/practice-test/physics/10" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
];

const PAK_ARMY_SOLDIER_QUIZZES = [
  { title: "Verbal Intelligence", desc: "Logic & Reasoning", path: "/practice-test/verbal/test" },
  { title: "Non-Verbal Intelligence Test", desc: "Visual Reasoning", path: "/practice-test/non-verbal/test" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
];

const PUNJAB_POLICE_QUIZZES = [
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
  { title: "English", desc: "Grammar & Comprehension", path: "/practice-test/english/notes" },
  { title: "Urdu", desc: "Urdu Grammar & Vocabulary", path: "/practice-test/urdu/test" },
  { title: "Basic Math", desc: "Fundamental Mathematics", path: "/practice-test/math/basic" },
];

const RANGERS_QUIZZES = [
  { title: "Basic Math", desc: "Fundamental Mathematics", path: "/practice-test/math/basic" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
  { title: "English", desc: "Grammar & Comprehension", path: "/practice-test/english/notes" },
  { title: "Urdu", desc: "Urdu Grammar & Vocabulary", path: "/practice-test/urdu/test" },
];

const LAT_QUIZZES = [
  { title: "English", desc: "Grammar & Comprehension", path: "/practice-test/english/notes" },
  { title: "General Knowledge", desc: "Global & Domestic Facts", path: "/practice-test/gk/test" },
  { title: "Islamiyat", desc: "Islamic Principles & History", path: "/practice-test/islamiat/notes" },
  { title: "Pak Studies", desc: "History & Geography", path: "/practice-test/pak-studies/notes" },
  { title: "Urdu", desc: "Urdu Grammar & Vocabulary", path: "/practice-test/urdu/test" },
  { title: "Basic Math", desc: "Fundamental Mathematics", path: "/practice-test/math/basic" },
];

const MDCAT_QUIZZES = [
  { title: "Logical Reasoning (Live)", desc: "25 New questions from Roshan Services Academy", path: "/practice-test/mdcat-logical/test" },
  { title: "Biology Class 9th", desc: "Core Principles of Biology", path: "/practice-test/biology/9" },
  { title: "Biology Class 10th", desc: "Core Principles of Biology", path: "/practice-test/biology/10" },
  { title: "Biology Class 11th", desc: "Core Principles of Biology", path: "/practice-test/biology/11" },
  { title: "Biology Class 12th", desc: "Core Principles of Biology", path: "/practice-test/biology/12" },
  { title: "Chemistry Class 9th", desc: "Fundamental Chemistry", path: "/practice-test/chemistry/9" },
  { title: "Chemistry Class 10th", desc: "Chemical Reactions", path: "/practice-test/chemistry/10" },
  { title: "Chemistry Class 11th", desc: "Higher Chemistry I", path: "/practice-test/chemistry/11" },
  { title: "Chemistry Class 12th", desc: "Higher Chemistry II", path: "/practice-test/chemistry/12" },
  { title: "Physics Class 9th", desc: "Physics Fundamentals", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Physics Fundamentals", path: "/practice-test/physics/10" },
  { title: "Physics Class 11th", desc: "Advanced Physics I", path: "/practice-test/physics/11" },
  { title: "Physics Class 12th", desc: "Advanced Physics II", path: "/practice-test/physics/12" },
  { title: "English", desc: "Grammar & Comprehension", path: "/practice-test/english/notes" },
];

const E_CAT_QUIZZES = [
  { title: "Mathematics Class 9th", desc: "Fundamental Mathematics", path: "/practice-test/math/9" },
  { title: "Mathematics Class 10th", desc: "Advanced Mathematics", path: "/practice-test/math/10" },
  { title: "Mathematics Class 11th", desc: "Higher Mathematics I", path: "/practice-test/math/11" },
  { title: "Mathematics Class 12th", desc: "Higher Mathematics II", path: "/practice-test/math/12" },
  { title: "Physics Class 9th", desc: "Physics Fundamentals", path: "/practice-test/physics/9" },
  { title: "Physics Class 10th", desc: "Physics Fundamentals", path: "/practice-test/physics/10" },
  { title: "Physics Class 11th", desc: "Advanced Physics I", path: "/practice-test/physics/11" },
  { title: "Physics Class 12th", desc: "Advanced Physics II", path: "/practice-test/physics/12" },
  { title: "Chemistry Class 9th", desc: "Fundamental Chemistry", path: "/practice-test/chemistry/9" },
  { title: "Chemistry Class 10th", desc: "Chemical Reactions", path: "/practice-test/chemistry/10" },
  { title: "Chemistry Class 11th", desc: "Higher Chemistry I", path: "/practice-test/chemistry/11" },
  { title: "Chemistry Class 12th", desc: "Higher Chemistry II", path: "/practice-test/chemistry/12" },
  { title: "Computer Class 9th", desc: "Computer Science Basics", path: "/practice-test/computer/9" },
  { title: "Computer Class 10th", desc: "Computer Science Concepts", path: "/practice-test/computer/10" },
  { title: "Computer Class 11th", desc: "Advanced Programming I", path: "/practice-test/computer/11" },
  { title: "Computer Class 12th", desc: "Advanced Programming II", path: "/practice-test/computer/12" },
  { title: "English", desc: "Grammar & Comprehension", path: "/practice-test/english/notes" },
];

const CATEGORY_INFO: Record<string, { label: string, value: string }[]> = {
  "GD (Pilot)": [
    { label: "Age Limit", value: "16 - 22 Years" },
    { label: "Height Requirements", value: "Min 5 ft 4 in (163 cm)" },
    { label: "Prior Education", value: "FSc (Pre-Eng/Pre-Med/CS) or A-Level" },
    { label: "Core Subjects", value: "Physics, English, Intelligence (Verbal/Non-Verbal)" },
    { label: "Tests Held", value: "Twice a year (Feb & Aug)" },
    { label: "Selection Process", value: "Initial Written -> Medical -> ISSB -> Final CMB" }
  ],
  "PMA long course": [
    { label: "Age Limit", value: "17 - 22 Years" },
    { label: "Height Requirements", value: "Min 5 ft 4 in (162.5 cm)" },
    { label: "Prior Education", value: "FA/FSc or equivalent (Min 55% marks)" },
    { label: "Core Subjects", value: "English, Math, Pak Studies, Islamiat, GK, Intelligence" },
    { label: "Tests Held", value: "Twice a year (April & October)" },
    { label: "Selection Process", value: "Written -> Physical -> Medical -> ISSB -> Interview" }
  ],
  "PN CADET": [
    { label: "Age Limit", value: "16.5 - 21 Years" },
    { label: "Height Requirements", value: "Min 5 ft 4 in (163 cm)" },
    { label: "Prior Education", value: "FSc (Pre-Eng/CS) or O/A Level (Physics & Math)" },
    { label: "Core Subjects", value: "English, Math, Physics, Gen Knowledge, Intelligence" },
    { label: "Tests Held", value: "Twice a year (May & November)" },
    { label: "Selection Process", value: "Entrance Test -> Medical -> ISSB -> Naval HQ Interview" }
  ],
  "AFNS": [
    { label: "Age Limit", value: "17 - 25 Years" },
    { label: "Height Requirements", value: "Min 5 ft (152.4 cm)" },
    { label: "Prior Education", value: "Matric with Science / FSc (Pre-Medical)" },
    { label: "Core Subjects", value: "Biology, Physics, Chemistry, English, Intelligence" },
    { label: "Tests Held", value: "Once a year (July/August)" },
    { label: "Selection Process", value: "Written/Intelligence -> Medical -> Interview" }
  ],
  "ASF": [
    { label: "Age Limit", value: "18 - 25 Years (Relaxation applies)" },
    { label: "Height Requirements", value: "Male: 5'6\" | Female: 5'2\"" },
    { label: "Prior Education", value: "Matric (Corporal) / BA/BSc (ASI/Inspector)" },
    { label: "Core Subjects", value: "English, Pak Studies, Islamiat, GK, Everyday Science" },
    { label: "Tests Held", value: "Depends on vacancies (Usually Annual)" },
    { label: "Selection Process", value: "Physical -> Written -> Medical -> Interview" }
  ],
  "Airmen": [
    { label: "Age Limit", value: "15.5 - 20 Years" },
    { label: "Height Requirements", value: "Min 5 ft 4 in (163 cm)" },
    { label: "Prior Education", value: "Matric Science (Min 60% marks)" },
    { label: "Core Subjects", value: "English, Math, Physics, Intelligence" },
    { label: "Tests Held", value: "Multiple times a year" },
    { label: "Selection Process", value: "Written -> Medical -> Interview -> Final Merit" }
  ],
  "Sailor": [
    { label: "Age Limit", value: "16 - 20 Years" },
    { label: "Height Requirements", value: "Min 5 ft 4 in (162.5 cm)" },
    { label: "Prior Education", value: "Matric Science (Min 60% marks)" },
    { label: "Core Subjects", value: "English, Math, Physics, Gen Knowledge" },
    { label: "Tests Held", value: "Usually twice a year" },
    { label: "Selection Process", value: "Written -> Physical -> Medical -> Interview" }
  ],
  "Sailer": [
    { label: "Age Limit", value: "16 - 20 Years" },
    { label: "Height Requirements", value: "Min 5 ft 4 in (162.5 cm)" },
    { label: "Prior Education", value: "Matric Science (Min 60% marks)" },
    { label: "Core Subjects", value: "English, Math, Physics, Gen Knowledge" },
    { label: "Tests Held", value: "Usually twice a year" },
    { label: "Selection Process", value: "Written -> Physical -> Medical -> Interview" }
  ],
  "Pak Army Soldier": [
    { label: "Age Limit", value: "17.5 - 23 Years" },
    { label: "Height Requirements", value: "Min 5 ft 6 in (167.5 cm)" },
    { label: "Prior Education", value: "Matric or above" },
    { label: "Core Subjects", value: "Verbal/Non-Verbal Intelligence, Basic GK" },
    { label: "Tests Held", value: "Twice a year (Spring & Autumn)" },
    { label: "Selection Process", value: "Physical -> Written -> Medical -> Interview" }
  ],
  "Punjab Police": [
    { label: "Age Limit", value: "18 - 22 Years" },
    { label: "Height Requirements", value: "Male: 5'7\" | Female: 5'2\"" },
    { label: "Prior Education", value: "Matric (Min 50% marks)" },
    { label: "Core Subjects", value: "General Knowledge, English, Urdu, Basic Math" },
    { label: "Tests Held", value: "Based on provincial allocations" },
    { label: "Selection Process", value: "Physical Measure -> Endurance -> Written -> Interview" }
  ],
  "Rangers": [
    { label: "Age Limit", value: "18 - 30 Years" },
    { label: "Height Requirements", value: "Min 5 ft 6 in (167.5 cm)" },
    { label: "Prior Education", value: "Middle, Matric, FA/FSc (Rank dependent)" },
    { label: "Core Subjects", value: "Basic Math, GK, English, Urdu" },
    { label: "Tests Held", value: "Annual recruitments" },
    { label: "Selection Process", value: "Registration -> Measurement -> Written -> Medical -> Interview" }
  ],
  "LAT": [
    { label: "Age Limit", value: "No upper age limit" },
    { label: "Height Requirements", value: "Not Applicable" },
    { label: "Prior Education", value: "HSSC (12 years of education) or equivalent" },
    { label: "Core Subjects", value: "Essay, Personal Statement, English, GK, Islamiat, Pak Studies, Urdu, Math" },
    { label: "Tests Held", value: "3 to 4 times a year by HEC" },
    { label: "Selection Process", value: "100 Marks Written Exam (Passing requires 50)" }
  ],
  "MDCAT": [
    { label: "Age Limit", value: "No upper age limit" },
    { label: "Height Requirements", value: "Not Applicable" },
    { label: "Prior Education", value: "FSc Pre-Medical" },
    { label: "Core Subjects", value: "Biology, Chemistry, Physics, English, Logical Reasoning" },
    { label: "Tests Held", value: "Once a year (Usually Aug/Sept)" },
    { label: "Selection Process", value: "PMDC centralized examination" }
  ],
  "E-CAT": [
    { label: "Age Limit", value: "No upper age limit" },
    { label: "Height Requirements", value: "Not Applicable" },
    { label: "Prior Education", value: "FSc Pre-Engineering/ICS or equivalent" },
    { label: "Core Subjects", value: "Math, Physics, Chemistry/Computer, English" },
    { label: "Tests Held", value: "Once a year (Usually mid-year before admissions)" },
    { label: "Selection Process", value: "UET centralized entry test" }
  ],
  "ANF": [
    { label: "Age Limit", value: "Depends on specific advertisement" },
    { label: "Height Requirements", value: "Depends on specific advertisement" },
    { label: "Prior Education", value: "Graduation (14 years of education)" },
    { label: "Core Subjects", value: "General Knowledge, English, Pak Studies, Islamiat" },
    { label: "Tests Held", value: "As per job openings" },
    { label: "Selection Process", value: "Written Test -> Physical/Medical -> Interview" }
  ],
};

export function StudyNotes() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<'google' | 'native'>('google');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Student notes states
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPdfUrl, setUploadPdfUrl] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState<string | null>(null);
  const [isContributorDropdownOpen, setIsContributorDropdownOpen] = useState(false);
  const [contributorSearchQuery, setContributorSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState(false);
  const [showNonVerbalSoon, setShowNonVerbalSoon] = useState(false);

  useEffect(() => {
    if (!selectedCategory || selectedSubCategory !== 'student_notes') return;

    const q = query(
      collection(db, 'student_notes'),
      where('category', '==', selectedCategory)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          title: data.title || '',
          pdfUrl: data.pdfUrl || '',
          category: data.category || '',
          uploadedBy: data.uploadedBy || '',
          uploaderName: data.uploaderName || 'Anonymous',
          uploaderPhoto: data.uploaderPhoto || '',
          uploaderRole: data.uploaderRole || 'student',
          createdAt: data.createdAt,
          createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date(0))
        };
      });
      
      // Client-side sort to be fully robust and index-creation friendly
      notesList.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());
      setStudentNotes(notesList);
    }, (error) => {
      console.error('Error fetching student notes:', error);
    });

    return () => unsubscribe();
  }, [selectedCategory, selectedSubCategory]);

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!uploadTitle.trim() || !uploadPdfUrl.trim()) {
      setUploadError('Please fill in all fields.');
      return;
    }

    // Basic URL validation
    let formattedUrl = uploadPdfUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setUploadError('Please provide a valid URL for the file/pdf (e.g. drive.google.com/file/... or dropbox.com/...)');
      return;
    }

    setUploadingState(true);
    setUploadError(null);

    try {
      await addDoc(collection(db, 'student_notes'), {
        title: uploadTitle.trim(),
        pdfUrl: formattedUrl,
        category: selectedCategory,
        uploadedBy: user.uid,
        uploaderName: profile?.displayName || user.displayName || 'Anonymous',
        uploaderPhoto: profile?.photoURL || user.photoURL || '',
        uploaderRole: profile?.isAdmin ? 'admin' : 'student',
        createdAt: serverTimestamp()
      });

      setUploadTitle('');
      setUploadPdfUrl('');
      setIsUploading(false);
    } catch (err: any) {
      console.error('Error uploading note:', err);
      setUploadError(err.message || 'Failed to upload note.');
    } finally {
      setUploadingState(false);
    }
  };

  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDeleteNote = async () => {
    if (!noteToDeleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, 'student_notes', noteToDeleteId));
      setNoteToDeleteId(null);
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setDeleteError(err.message || 'Failed to delete note. You might not have permission.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Full screen PDF viewer
  if (selectedPdfUrl) {
    const fileName = (() => {
      try {
        const decoded = decodeURIComponent(selectedPdfUrl);
        const parts = decoded.split('/');
        const lastPart = parts[parts.length - 1];
        const cleanName = lastPart.split('?')[0];
        if (cleanName && cleanName.toLowerCase().endsWith('.pdf')) {
          return cleanName;
        }
      } catch (e) {
        // Fallback
      }
      return "Official Academy Study Material";
    })();

    return (
      <div className="min-h-screen bg-[#0a0f1d] flex flex-col font-sans selection:bg-[#c5a059]/30 h-screen overflow-hidden">
        {/* Header bar */}
        <div className="h-20 bg-[#0a0f1d] border-b border-white/5 px-4 md:px-8 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setSelectedPdfUrl(null)}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all group shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs md:text-sm font-black text-[#c5a059] uppercase tracking-wider truncate">Roshan Services Academy</h2>
              <p className="text-xs text-white/50 font-mono truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-xl" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>

          {/* Compact / Responsive segmented control for viewer type selection */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 md:p-1 rounded-xl border border-white/10 text-[9px] md:text-[10px] uppercase font-black tracking-wider shrink-0">
            <button
              onClick={() => setViewerMode('google')}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all duration-200 ${
                viewerMode === 'google'
                  ? 'bg-[#c5a059] text-[#0a0f1d]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Best for quick rendering on all devices"
            >
              <span className="hidden sm:inline">🌐 Google Reader</span>
              <span className="inline sm:hidden">🌐 Google</span>
            </button>
            <button
              onClick={() => setViewerMode('native')}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all duration-200 ${
                viewerMode === 'native'
                  ? 'bg-[#c5a059] text-[#0a0f1d]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Best for large books and syllabus PDFs (>25MB)"
            >
              <span className="hidden sm:inline">⚡ Native Viewer (Large Files)</span>
              <span className="inline sm:hidden">⚡ Native</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a 
              href={selectedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#c5a059] hover:bg-[#b5914f] text-[#0a0f1d] rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#c5a059]/10"
            >
              <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Open PDF in New Tab</span><span className="inline sm:hidden">Open</span>
            </a>
            
            <button 
              onClick={() => setSelectedPdfUrl(null)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white text-zinc-400 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* PDF Document Container */}
        <div className="flex-1 w-full bg-zinc-950 overflow-hidden relative">
          {viewerMode === 'google' ? (
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPdfUrl)}&embedded=true`}
              className="w-full h-full border-none absolute inset-0 bg-zinc-950"
              title="Google Preview PDF Viewer"
            />
          ) : (
            <iframe 
              src={`${selectedPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-none absolute inset-0 text-white bg-zinc-950"
              title="Native PDF Viewer"
            />
          )}

          {/* Quick Floating Action for extra convenience */}
          <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
            <a
              href={selectedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-[#0a0f1d] border border-white/15 hover:border-[#c5a059]/50 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-medium shadow-2xl backdrop-blur-md animate-bounce"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Having issues? Switch to ⚡ Native above or open directly
              <ExternalLink className="w-4 h-4 text-[#c5a059]" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // 1. Show Main Categories
    if (!selectedCategory) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCategory(cat.name)}
              className="group relative overflow-hidden rounded-[2rem] aspect-square flex flex-col items-center justify-center border border-white/10 glass-panel hover:border-[#c5a059] transition-all duration-300 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/50 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity" />
              <img 
                src={cat.image} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />
              <div className="relative z-20 flex flex-col items-center gap-2 mt-auto pb-6">
                <span className="font-black text-sm md:text-lg text-white uppercase tracking-wider text-center px-2">
                  {cat.name}
                </span>
                <div className="w-8 h-1 bg-[#c5a059] rounded-full group-hover:w-12 transition-all duration-300" />
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    // 2. Show Sub Categories for the selected Categories
    if (selectedCategory && !selectedSubCategory) {
      const infoList = CATEGORY_INFO[selectedCategory];

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Category Info Box */}
          {infoList && (
            <div className="glass-panel border-2 border-[#c5a059]/30 rounded-[2.5rem] p-8 relative overflow-hidden bg-white/5 shadow-2xl mb-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 blur-3xl rounded-full -mr-32 -mt-32" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 shadow-lg">
                  <Info className="w-6 h-6 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Test Information</h3>
                  <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mt-1">
                    {selectedCategory} Overview
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                {infoList.map((info, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-2 shrink-0 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{info.label}</p>
                      <p className="text-sm font-medium text-white">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {SUB_CATEGORIES.map((cat, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSubCategory(cat.id)}
                className="glass-panel border border-white/10 rounded-[2rem] p-8 flex items-center gap-6 shadow-2xl text-left hover:border-[#c5a059]/50 transition-all group bg-white/5"
              >
                <div className="w-16 h-16 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center border border-[#c5a059]/20 shadow-2xl group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                  <cat.icon className="w-8 h-8 text-[#c5a059] group-hover:text-black" />
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tight text-2xl uppercase">{cat.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium mt-1">{cat.desc}</p>
                </div>
                <ChevronRight className="w-6 h-6 ml-auto text-zinc-600 group-hover:text-white transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    // 3. Show Content based on selection
    if (selectedSubCategory === 'pdf_notes') {
      let displayNotes: any[] = [];
      if (selectedCategory === 'GD (Pilot)') {
        displayNotes = notes;
      } else if (selectedCategory === 'PMA long course') {
        displayNotes = PMA_LONG_COURSE_NOTES;
      } else if (selectedCategory === 'PN CADET') {
        displayNotes = PN_CADET_NOTES;
      } else if (selectedCategory === 'AFNS') {
        displayNotes = AFNS_NOTES;
      } else if (selectedCategory === 'ASF') {
        displayNotes = ASF_NOTES;
      } else if (selectedCategory === 'Airmen') {
        displayNotes = AIRMEN_NOTES;
      } else if (selectedCategory === 'Sailor' || selectedCategory === 'Sailer') {
        displayNotes = SAILOR_NOTES;
      } else if (selectedCategory === 'Pak Army Soldier') {
        displayNotes = PAK_ARMY_SOLDIER_NOTES;
      } else if (selectedCategory === 'Punjab Police') {
        displayNotes = PUNJAB_POLICE_NOTES;
      } else if (selectedCategory === 'Rangers') {
        displayNotes = RANGERS_NOTES;
      } else if (selectedCategory === 'LAT') {
        displayNotes = LAT_NOTES;
      } else if (selectedCategory === 'MDCAT') {
        displayNotes = MDCAT_NOTES;
      } else if (selectedCategory === 'E-CAT') {
        displayNotes = E_CAT_NOTES;
      } else if (selectedCategory === 'ANF') {
        displayNotes = ANF_SUB_INSPECTOR_NOTES;
      }
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNotes.map((note, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel border border-white/10 rounded-[2rem] p-8 flex flex-col items-start shadow-2xl text-left hover:border-[#c5a059]/50 transition-all group bg-white/5"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-2xl mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-black text-white tracking-tight text-xl mb-6 uppercase">
                {note.title}
              </h3>
              
              <div className="mt-auto w-full pt-6 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setSelectedPdfUrl(note.url)}
                  className="flex-1 py-4 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d4b16a] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#c5a059]/20"
                >
                  <BookOpen className="w-4 h-4" /> View PDF
                </button>
                <a 
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="w-14 shrink-0 py-4 bg-white/5 text-white rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
          {displayNotes.length === 0 && (
            <div className="col-span-full text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700">
              <FileText className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No PDFs Available yet for {selectedCategory}.</p>
            </div>
          )}
        </div>
      );
    }
    
    // 4. Live Quizzes Section
    if (selectedSubCategory === 'live_quizzes') {
      let displayQuizzes: any[] = [];
      if (selectedCategory === 'GD (Pilot)') {
        displayQuizzes = GD_PILOT_QUIZZES;
      } else if (selectedCategory === 'PMA long course') {
        displayQuizzes = PMA_LONG_COURSE_QUIZZES;
      } else if (selectedCategory === 'PN CADET') {
        displayQuizzes = PN_CADET_QUIZZES;
      } else if (selectedCategory === 'AFNS') {
        displayQuizzes = AFNS_QUIZZES;
      } else if (selectedCategory === 'ASF') {
        displayQuizzes = ASF_QUIZZES;
      } else if (selectedCategory === 'Airmen') {
        displayQuizzes = AIRMEN_QUIZZES;
      } else if (selectedCategory === 'Sailor' || selectedCategory === 'Sailer') {
        displayQuizzes = SAILER_QUIZZES;
      } else if (selectedCategory === 'Pak Army Soldier') {
        displayQuizzes = PAK_ARMY_SOLDIER_QUIZZES;
      } else if (selectedCategory === 'Punjab Police') {
        displayQuizzes = PUNJAB_POLICE_QUIZZES;
      } else if (selectedCategory === 'Rangers') {
        displayQuizzes = RANGERS_QUIZZES;
      } else if (selectedCategory === 'LAT') {
        displayQuizzes = LAT_QUIZZES;
      } else if (selectedCategory === 'MDCAT') {
        displayQuizzes = MDCAT_QUIZZES;
      } else if (selectedCategory === 'E-CAT') {
        displayQuizzes = E_CAT_QUIZZES;
      } else if (selectedCategory === 'ANF') {
        displayQuizzes = ANF_SUB_INSPECTOR_QUIZZES;
      }
      
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayQuizzes.map((quiz, index) => {
            const isNonVerbal = quiz.path.includes('non-verbal');
            return (
              <motion.button 
                key={index}
                onClick={() => {
                  if (isNonVerbal) {
                    setShowNonVerbalSoon(true);
                  } else {
                    navigate(quiz.path);
                  }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-panel border rounded-[2rem] p-8 flex flex-col items-start group transition-all shadow-2xl text-left relative overflow-hidden bg-white/5 ${
                  isNonVerbal ? 'border-white/10 hover:border-yellow-500/40' : 'border-white/10 hover:border-[#c5a059]/50'
                }`}
              >
                {isNonVerbal && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[7px] font-black uppercase tracking-widest text-[#c5a059]">Soon</div>
                )}
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-2xl mb-6">
                  {isNonVerbal ? <Clock className="w-6 h-6 text-[#c5a059] animate-pulse" /> : <Play className="w-6 h-6" />}
                </div>
                <h3 className="font-black text-white tracking-tight text-xl mb-2 uppercase">
                  {quiz.title}
                </h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-8">{quiz.desc}</p>
                
                <div className="mt-auto w-full flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">
                    {isNonVerbal ? 'Uploading Soon' : 'Start Examination'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                    {isNonVerbal ? <Clock className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </div>
                </div>
              </motion.button>
            );
          })}
          {displayQuizzes.length === 0 && (
            <div className="col-span-full text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700">
              <Play className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Quizzes Available yet for {selectedCategory}.</p>
            </div>
          )}
        </div>
      );
    }

    if (selectedSubCategory === 'student_notes') {
      const uploaders = Array.from(
        new Map(
          studentNotes.map(n => [
            n.uploadedBy,
            { uid: n.uploadedBy, name: n.uploaderName, photo: n.uploaderPhoto }
          ])
        ).values()
      );

      const filteredNotes = uploaderFilter
        ? studentNotes.filter(n => n.uploadedBy === uploaderFilter)
        : studentNotes;

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Upload notes box */}
          <div className="p-6 md:p-8 glass-panel border border-white/10 rounded-[2.5rem] bg-white/[0.02]">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Upload className="w-6 h-6 text-[#c5a059]" /> Contribute to {selectedCategory} Student Notes
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Share helpful PDF study notes or files with fellow academy members.</p>
              </div>
              <button
                onClick={() => setIsUploading(!isUploading)}
                className="px-6 py-3 bg-[#c5a059] text-black rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#d4b16a] transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-auto shadow-lg"
              >
                {isUploading ? <X className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                {isUploading ? 'Cancel Upload' : 'Upload Study Notes'}
              </button>
            </div>

            <AnimatePresence>
              {isUploading && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleUploadNote}
                  className="mt-6 pt-6 border-t border-white/5 space-y-4 overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Notes Title</label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Physics past papers chapter 1"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">PDF Url or File Link</label>
                      <input
                        type="text"
                        value={uploadPdfUrl}
                        onChange={(e) => setUploadPdfUrl(e.target.value)}
                        placeholder="e.g. https://drive.google.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-red-400 text-xs font-semibold">{uploadError}</p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingState}
                      className="px-6 py-2.5 bg-[#c5a059] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                    >
                      {uploadingState ? 'Uploading...' : 'Submit Notes'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Filter by contributor section */}
          {studentNotes.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <Users className="w-4 h-4 text-[#c5a059]" /> Filter Contributor:
              </span>
              
              <div className="relative w-full sm:max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsContributorDropdownOpen(!isContributorDropdownOpen);
                    setContributorSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all select-none cursor-pointer"
                >
                  <span className="truncate">
                    {uploaderFilter === null 
                      ? 'ALL CONTRIBUTORS' 
                      : (uploaders.find(up => up.uid === uploaderFilter)?.name.toUpperCase() || 'ALL CONTRIBUTORS')}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#c5a059] transition-transform duration-200 shrink-0 ${isContributorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isContributorDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div 
                        className="fixed inset-0 z-30 pointer-events-auto"
                        onClick={() => {
                          setIsContributorDropdownOpen(false);
                          setContributorSearchQuery('');
                        }}
                      />
                      
                      {/* Dropdown Options */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 p-2 bg-[#0d1527] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col gap-1 text-left"
                      >
                        {/* Search Bar inside Dropdown */}
                        <div className="relative p-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                          <input
                            type="text"
                            value={contributorSearchQuery}
                            onChange={(e) => setContributorSearchQuery(e.target.value)}
                            placeholder="Search contributor..."
                            onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
                            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]/50 transition-all font-bold"
                          />
                        </div>

                        <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1 mt-1">
                          {/* Option: All Contributors */}
                          {('all contributors'.includes(contributorSearchQuery.toLowerCase())) && (
                            <button
                              onClick={() => {
                                setUploaderFilter(null);
                                setIsContributorDropdownOpen(false);
                                setContributorSearchQuery('');
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                uploaderFilter === null 
                                  ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/10' 
                                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              All Contributors ({studentNotes.length})
                            </button>
                          )}

                          {/* Filtered contributor list */}
                          {uploaders
                            .filter(up => up.name.toLowerCase().includes(contributorSearchQuery.toLowerCase()))
                            .map(up => {
                              const count = studentNotes.filter(n => n.uploadedBy === up.uid).length;
                              return (
                                <button
                                  key={up.uid}
                                  onClick={() => {
                                    setUploaderFilter(up.uid);
                                    setIsContributorDropdownOpen(false);
                                    setContributorSearchQuery('');
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                                    uploaderFilter === up.uid 
                                      ? 'bg-[#c5a059] text-black font-black' 
                                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  {up.photo ? (
                                    <img src={up.photo} alt={up.name} className="w-5 h-5 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${uploaderFilter === up.uid ? 'bg-black/20 text-black' : 'bg-zinc-800 text-[#c5a059]'}`}>
                                      {up.name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="truncate flex-1 font-bold">{up.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${uploaderFilter === up.uid ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-500'}`}>{count}</span>
                                </button>
                              );
                            })}

                          {uploaders.filter(up => up.name.toLowerCase().includes(contributorSearchQuery.toLowerCase())).length === 0 && 
                           !('all contributors'.includes(contributorSearchQuery.toLowerCase())) && (
                            <p className="text-zinc-500 text-[10px] p-4 text-center">No contributors found</p>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Grid of study notes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel border border-white/10 rounded-[2rem] p-8 flex flex-col items-start shadow-2xl text-left hover:border-[#c5a059]/50 transition-all group bg-white/5 relative"
              >
                {/* Uploader Profile Banner */}
                <div className="flex items-center gap-3 mb-6 bg-white/5 p-2 rounded-2xl border border-white/5 w-full">
                  {note.uploaderPhoto ? (
                    <img src={note.uploaderPhoto} alt={note.uploaderName} className="w-8 h-8 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-bold text-[#c5a059] border border-white/5 shrink-0">
                      {note.uploaderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{note.uploaderName}</p>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{note.uploaderRole || 'Student'}</p>
                  </div>
                  
                  {(user?.uid === note.uploadedBy || profile?.isAdmin) && (
                    <button
                      onClick={() => {
                        setNoteToDeleteId(note.id);
                        setDeleteError(null);
                      }}
                      className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl transition-all"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-2xl mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white tracking-tight text-xl mb-6 uppercase line-clamp-2 w-full">
                  {note.title}
                </h3>
                
                <div className="mt-auto w-full pt-6 border-t border-white/5 flex gap-3">
                  <button 
                    onClick={() => setSelectedPdfUrl(note.pdfUrl)}
                    className="flex-1 py-4 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d4b16a] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#c5a059]/20"
                  >
                    <BookOpen className="w-4 h-4" /> View PDF
                  </button>
                  <a 
                    href={note.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in new tab"
                    className="w-14 shrink-0 py-4 bg-white/5 text-white rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
            
            {filteredNotes.length === 0 && (
              <div className="col-span-full text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700 w-full">
                <Users className="w-16 h-16 mx-auto mb-6 opacity-10 text-zinc-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  No study notes uploaded yet for {selectedCategory} {uploaderFilter ? 'by this contributor' : ''}.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedSubCategory === 'related_books_and_notes') {
      let displayBooks: any[] = [];
      if (selectedCategory === 'GD (Pilot)') {
        displayBooks = GD_PILOT_RELATED_BOOKS;
      } else if (selectedCategory === 'PMA long course') {
        displayBooks = PMA_LONG_COURSE_RELATED_BOOKS;
      } else if (selectedCategory === 'ANF') {
        displayBooks = ANF_RELATED_BOOKS;
      } else if (selectedCategory === 'E-CAT') {
        displayBooks = ECAT_RELATED_BOOKS;
      } else if (selectedCategory === 'MDCAT') {
        displayBooks = MDCAT_RELATED_BOOKS;
      } else if (selectedCategory === 'LAT') {
        displayBooks = LAT_RELATED_BOOKS;
      } else if (selectedCategory === 'Rangers') {
        displayBooks = RANGERS_RELATED_BOOKS;
      } else if (selectedCategory === 'Punjab Police') {
        displayBooks = PUNJAB_POLICE_RELATED_BOOKS;
      } else if (selectedCategory === 'Pak Army Soldier') {
        displayBooks = PAK_ARMY_SOLDIER_RELATED_BOOKS;
      } else if (selectedCategory === 'Sailor' || selectedCategory === 'Sailer') {
        displayBooks = SAILOR_RELATED_BOOKS;
      } else if (selectedCategory === 'Airmen') {
        displayBooks = AIRMEN_RELATED_BOOKS;
      } else if (selectedCategory === 'PN CADET') {
        displayBooks = PN_CADET_RELATED_BOOKS;
      } else if (selectedCategory === 'AFNS') {
        displayBooks = AFNS_RELATED_BOOKS;
      } else if (selectedCategory === 'ASF') {
        displayBooks = ASF_RELATED_BOOKS;
      }
      
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBooks.map((book, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => setSelectedPdfUrl(book.url)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel border border-white/10 rounded-[2rem] p-8 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-2xl text-left relative overflow-hidden bg-white/5 w-full cursor-pointer focus:outline-none"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-2xl mb-6">
                <LibrarySquare className="w-6 h-6" />
              </div>
              <h3 className="font-black text-white tracking-tight text-xl mb-2 uppercase">
                {book.title}
              </h3>
              
              <div className="mt-auto w-full flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Read Book</span>
                <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </motion.button>
          ))}
          {displayBooks.length === 0 && (
            <div className="col-span-full text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700">
              <LibrarySquare className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Related Books and Notes Available yet for {selectedCategory}.</p>
            </div>
          )}
        </div>
      );
    }
    
    // Fallback for other sub-categories (Past Papers, etc)
    return (
      <div className="text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700">
        <Navigation className="w-16 h-16 mx-auto mb-6 opacity-10" />
        <h3 className="font-black text-white text-2xl uppercase mb-2">Coming Soon</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Content for {selectedSubCategory.replace('_', ' ')} will be available shortly.</p>
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (selectedSubCategory && selectedCategory) {
      const subTitle = SUB_CATEGORIES.find(s => s.id === selectedSubCategory)?.title;
      return `${selectedCategory} - ${subTitle}`;
    }
    if (selectedCategory) return selectedCategory;
    return 'Study Notes Categories';
  };

  const handleBack = () => {
    if (selectedSubCategory) {
      setSelectedSubCategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto font-sans selection:bg-[#c5a059]/30">
      {selectedCategory && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={handleBack}
              className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all group shadow-2xl shrink-0"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-2 md:gap-4 leading-tight">
                {getHeaderTitle()}
              </h1>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Roshan Services Academy
              </p>
            </div>
          </div>
        </div>
      )}

      {renderContent()}

      {/* Custom Confirmation Modal for Safe Deletion in Iframes */}
      {noteToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0a0f1d]/80 backdrop-blur-md"
            onClick={() => {
              if (!isDeleting) {
                setNoteToDeleteId(null);
                setDeleteError(null);
              }
            }}
          />
          <div className="relative bg-[#0d1527] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">
              Delete Study Note?
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-medium leading-relaxed font-sans text-left">
              Are you sure you want to delete this study note? This will permanently remove the record from public library.
            </p>

            {deleteError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-sans text-left">
                {deleteError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setNoteToDeleteId(null);
                  setDeleteError(null);
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDeleteNote}
                className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-Verbal Soon Modal Overlay */}
      <AnimatePresence>
        {showNonVerbalSoon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0f1d]/85 backdrop-blur-md"
              onClick={() => setShowNonVerbalSoon(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#0d1527] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center z-10"
            >
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-xl mx-auto mb-6">
                <Clock className="w-8 h-8 text-[#c5a059] animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">
                Coming Soon
              </h3>
              
              <p className="text-xs text-zinc-400 mb-8 font-medium leading-relaxed">
                The Non-Verbal Intelligence Test is currently in working and will be uploaded soon. Thank you for your patience!
              </p>

              <button
                type="button"
                onClick={() => setShowNonVerbalSoon(false)}
                className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:from-[#d1ab64] hover:to-[#e8c67e] text-black font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-[#c5a059]/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
