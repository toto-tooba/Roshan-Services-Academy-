export interface LibraryItem {
  title: string;
  url: string;
  category: string;
}

export const LIBRARY_DATA: LibraryItem[] = [
  // GD Pilot
  { title: "100 Physics Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/100-Physics-Questions.pdf", category: "GD (Pilot)" },
  { title: "FSc Part-1 Maths MCQs", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/FSc%20Part-1%20maths%20mcqs.pdf", category: "GD (Pilot)" },
  { title: "FSc Part-2 Maths MCQs", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/FSc%20part-2%20maths%20mcqs.pdf", category: "GD (Pilot)" },
  { title: "Maths Int. for Officers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/maths%20intermediate%20for%20commissioned%20officers.pdf", category: "GD (Pilot)" },
  { title: "Non Verbal Intelligence 4", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Non%20verbal%20(4).pdf", category: "GD (Pilot)" },
  { title: "Non Verbal Intelligence 7", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Non%20verbal%20(7).pdf", category: "GD (Pilot)" },
  { title: "PAF GD-P Book 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PAF-GD-P-Book1.pdf", category: "GD (Pilot)" },
  { title: "Verbal Intelligence Test 5", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Verbal%20Intelligence%20Test5.pdf", category: "GD (Pilot)" },
  { title: "Verbal Intelligence Tests Online", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/verbal-intelligence-tests-online.pdf", category: "GD (Pilot)" },
  { title: "Dogars Test Masters (PAF GDP)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/696878055-Dogars-Test-Masters-for-PAF-GDP-AD-A-SD.pdf", category: "GD (Pilot)" },

  // PMA Long Course
  { title: "PMA Long Course Preparation Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/530887550-PMA-Long-Course-Preparation-Book-by-Urdu-Books-Group-1-Copy.pdf", category: "PMA Long Course" },
  { title: "PMA Long Course Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20long%20Course.pdf", category: "PMA Long Course" },
  { title: "PMA Maths 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Maths%202.pdf", category: "PMA Long Course" },
  { title: "PMA Maths Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Maths%20Notes.pdf", category: "PMA Long Course" },
  { title: "PMA Verbal Intelligence 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Verbal%20intelligence%202.pdf", category: "PMA Long Course" },
  { title: "PMA Verbal Intelligence Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/PMA%20Verbal%20intelligence.pdf", category: "PMA Long Course" },

  // AFNS
  { title: "AFNS Experience 24-Aug-2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/afns-experience-24-Aug-2020.pdf", category: "AFNS" },
  { title: "AFNS Notes 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Afns-Notes-1-1.pdf", category: "AFNS" },
  { title: "AFNS Notes 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Afns-Notes-2-2.pdf", category: "AFNS" },
  { title: "AFNS Notes 4", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Afns-Notes-4.pdf", category: "AFNS" },
  { title: "Physics AFNS Past Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Physics-AFNS-Past-Papers-1.pdf", category: "AFNS" },
  { title: "Biology 11th Class (AFNS)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%2011th%20Class.pdf", category: "AFNS" },

  // ASF
  { title: "ASF (ASI) Urdu Dogar Unique", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF/ASF%20(ASI)%20Urdu%20Dogar%20Unique%202022-2023.pdf", category: "ASF" },
  { title: "ASF Corporal Guide BPS 07", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF/ASF%20Corporal%20Guide%20BPS%2007%20Caravan.pdf", category: "ASF" },
  { title: "ASF Past Paper ASI Corporal", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF/ASF-Past-Paper-ASI-Corporal.pdf", category: "ASF" },
  { title: "ASF Everyday Science", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF%20EVERYDAY%20SCIENCE.pdf", category: "ASF" },

  // ANF
  { title: "ANF Sub-Inspector Paper 2021", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/Today%20Paper%20of%20Sub-Inspector%20ANF%20held%20on%2031-01-2021.pdf", category: "ANF" },
  { title: "ANF SI Past Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20ASI%20and%20SI%20Past%20Papers%20important%20for%20Next%20Upcoming%20Tests.pdf", category: "ANF" },
  { title: "ANF Constable Past Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Constable%20ASI%20and%20Sub%20Inspector%20Past%20Papers%20important%20for%20Next%20Upcoming%20Tests.pdf", category: "ANF" },
  { title: "ANF MCQS Book 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20MCQS%20-1%20(1).pdf", category: "ANF" },
  { title: "ANF MCQS Original Paper v1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v1.pdf", category: "ANF" },
  { title: "ANF MCQS Original Paper v2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v2.pdf", category: "ANF" },
  { title: "ANF MCQS Original Paper v3", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v3.pdf", category: "ANF" },
  { title: "ANF MCQS Original Paper v4", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v4.pdf", category: "ANF" },
  { title: "ANF MCQS Original Paper v5", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ANF%20Notes/ANF%20Mcqs%20Original%20Past%20Paper%20helpful%20for%20AD,%20Assistant%20&%20Sub-Inspector,%20ASI%20v5.pdf", category: "ANF" },

  // ECAT
  { title: "ECAT Past Paper 2010", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202010.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2011", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202011.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2012", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202012.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2014-1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202014-1.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2014", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202014.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2015", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202015.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2016", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202016.pdf", category: "ECAT" },
  { title: "ECAT Past Paper 2017", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT%20Past%20Paper%202017.pdf", category: "ECAT" },
  { title: "ECAT Entrance 2011-2012", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT-2011-2012.pdf", category: "ECAT" },
  { title: "ECAT Entrance 2011", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/ECAT-2011.pdf", category: "ECAT" },
  { title: "ECAT Entrance 2013", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/Ecat-2013.pdf", category: "ECAT" },
  { title: "ECAT Entrance 2015", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/Ecat-2015.pdf", category: "ECAT" },
  { title: "UET Lahore ECAT Mathematics", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/UET-Lahore-ECAT-Entrance-Test-2019-Mathematics.pdf", category: "ECAT" },
  { title: "Dogars ECAT Guide", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ECAT/Dogars%20ECAT%20Book-compressed.pdf", category: "ECAT" },

  // MDCAT
  { title: "UHS MDCAT 2024 Paper", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2455-UHS%20MDCAT%202024%20Original%20Paper%20with%20Answer%20Key%20PDF-by-Admin-(taleem360.com).pdf", category: "MDCAT" },
  { title: "KMU MDCAT 2024 (Code A)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2456-KMU%20MDCAT%20Paper%202024%20PDF%20with%20Answers%20Key%20(Code%20A)-by-Admin-(taleem360.com).pdf", category: "MDCAT" },
  { title: "KMU MDCAT 2024 (Code B)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2457-KMU%20MDCAT%202024%20Original%20Paper%20PDF%20with%20Answers%20(Code%20B)-by-Admin-(taleem360.com).pdf", category: "MDCAT" },
  { title: "DUHS Sindh MDCAT 2024", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2467-DUHS%20Sindh%20MDCAT%202024%20Paper%20PDF%20by%20SKN-by-Admin-(taleem360.com).pdf", category: "MDCAT" },
  { title: "KIPS Logical Reasoning MDCAT", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2549-KIPS%20KDP%20Logical%20Reasoning%20MDCAT%202025%20Book%20PDF-(taleem360.com).pdf", category: "MDCAT" },
  { title: "Torcia Chemistry MDCAT", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2551-Torcia%20MDCAT%20Chemistry%20Preparation%20Book%20PDF-(taleem360.com).pdf", category: "MDCAT" },
  { title: "KIPS English Grammar MDCAT", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2552-KIPS%20KDP%20MDCAT%20English%20Grammar%20Practice%20Book%20PDF-(taleem360.com).pdf", category: "MDCAT" },
  { title: "UHS MDCAT 2025 Paper", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2764-UHS%20MDCAT%202025%20Original%20Paper%20with%20Answer%20Key%20PDF-(taleem360.com).pdf", category: "MDCAT" },
  { title: "KMU MDCAT 2025 Paper", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2765-KMU%20MDCAT%202025%20Paper%20PDF%20with%20Answer%20Key-(taleem360.com).pdf", category: "MDCAT" },
  { title: "SZABMU MDCAT 2025 Paper", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/2767-SZABMU%20MDCAT%202025%20Paper%20PDF%20with%20Answer%20Key-(taleem360.com).pdf", category: "MDCAT" },
  { title: "MDCAT 2017 Reconduct", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202017%20Reconduct.pdf", category: "MDCAT" },
  { title: "MDCAT 2017 Paper", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202017.pdf", category: "MDCAT" },
  { title: "MDCAT 2018 Paper 1", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202018-1.pdf", category: "MDCAT" },
  { title: "MDCAT 2018 Original", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%202018.pdf", category: "MDCAT" },
  { title: "MDCAT Biology Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%20Biology%20preparation%20Book.pdf", category: "MDCAT" },
  { title: "MDCAT Physics Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%20Physics%20Preparation%20Book.pdf", category: "MDCAT" },
  { title: "MDCAT Unit Wise (11-16)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/MDCAT%20Unit%20Wise%20(2011-16).pdf", category: "MDCAT" },
  { title: "UHS MDCAT 2023 Paper D", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/UHS%20MDCAT%202023%20Paper%20D%20with%20Answer%20Key%20(taleem360.com).pdf", category: "MDCAT" },
  { title: "MDCAT Logical Reasoning", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT%20Logical%20Reasoning%20Questions.pdf", category: "MDCAT" },

  // LAT
  { title: "LAT Past Paper 2023 Nov", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/2350-LAT%20Past%20Paper%2012%20November%202023%20PDF%20(Feedback%20MCQs)-by-Admin-(taleem360.com).pdf", category: "LAT" },
  { title: "LAT Past Paper 2024 Feb", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/2584-LAT%20Past%20Paper%20PDF%20(04%20February%202024)-(taleem360.com).pdf", category: "LAT" },
  { title: "LAT Preparation Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/2793-Law%20Admission%20Test%20LAT%20Preparation%20Book%20by%20Sir%20Omar-(taleem360.com).pdf", category: "LAT" },
  { title: "LAT Past Paper Oct 2021", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2003%20October%202021.pdf", category: "LAT" },
  { title: "LAT Past Paper July 2023", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2016%20July%202023%20(taleem360.com).pdf", category: "LAT" },
  { title: "LAT Past Paper Aug 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2021%20AUGUST%202022.pdf", category: "LAT" },
  { title: "LAT Past Paper May 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2022%20May%202022.pdf", category: "LAT" },
  { title: "LAT Past Paper Nov 2021", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2028%20November%202021.pdf", category: "LAT" },
  { title: "LAT Past Paper Jan 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%2030%20January%202022.pdf", category: "LAT" },
  { title: "LAT Past Paper Sep 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/LAT%20Past%20Paper%20september%202020%20Website%20Copy.pdf", category: "LAT" },
  { title: "Law Admission Dec 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/Law%20Admission%20Test%202020%20December.pdf", category: "LAT" },
  { title: "Law Admission Jan 2023", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT/Law%20Admission%20Test%2022%20Jan%202023.pdf", category: "LAT" },
  { title: "LAT Essays", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Most%20Common%20LAT%20Essay%20Topics.pdf", category: "LAT" },
  { title: "LAT Personal Statements", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT%20Personal%20Statements.pdf", category: "LAT" },

  // Rangers
  { title: "Islamiat Solved Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/105%20Islamiat%20Solved%20Questions%20Important.pdf", category: "Rangers" },
  { title: "Ranger Past Paper 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Ranger%20Solved%20Past%20Paper%20held%20on%202020.pdf", category: "Rangers" },
  { title: "Rangers Solved Paper", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Rangers/Rangers%20Solved%20Past%20Paper%20Pdf.pdf", category: "Rangers" },

  // Punjab Police
  { title: "FIA Constable 2019", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/FIA%20Constable%20paper%202019%20download%20from%20www-doc4shares-com.pdf", category: "Punjab Police" },
  { title: "ICT Police 2022", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/ICT%20Islamabad%20Police%20Constable%20Solved%20Past%20Papers%20held%20on%2031-12-2022.pdf", category: "Punjab Police" },
  { title: "Punjab Police 2022 Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Punjab%20Police%20Test%2005-03-2022.pdf", category: "Punjab Police" },
  { title: "Punjab Police Traffic 2024", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Punjab%20Police%20Traffic%20Assistant,%20Constable,%20Lady%20Constable,%20Driver%20Past%20Paper%20held%20on%2022%20March%202024.pdf", category: "Punjab Police" },
  { title: "Traffic Police Constable 2020", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/Traffic%20Police%20Constable%20Past%20Paper%20held%20on%202020.pdf", category: "Punjab Police" },
  { title: "Police Book (doc4shares)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Punjab%20Police/POLICE_BOOK-doc4shares-com.pdf", category: "Punjab Police" },

  // Pak Army Soldier
  { title: "Intelligence Mcqs (Soldier)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Intelligence%20Solved%20Mcqs%20Exercise%20for%20PAF,%20Navy,%20Army,%20Commission%20Tests.pdf", category: "General Intelligence" },
  { title: "VERBAL Intelligence (Combined)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/VERBAL%20PAF,%20NAVY,%20ARMY,%20PMA.pdf", category: "General Intelligence" },
  { title: "Pak Army Soldier Guide", url: "https://drive.google.com/file/d/1BfOvqyt5fKdU4NfL4hHXw-eYjdIOqp0X/view?usp=sharing", category: "Pak Army Soldier" },

  // Sailor
  { title: "P.Navy Sailors Guide", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Sailor/P.Navy%20Sailors%20Guide%20for%20tests.pdf", category: "Sailor" },
  { title: "P.Navy English Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Pak%20Navy%20Sailors%20Notes%20of%20English.pdf", category: "Sailor" },

  // PN Cadet
  { title: "Pak Navy Initial Tests", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Pak%20Navy%20initial%20tests.pdf", category: "PN Cadet" },
  { title: "Pak-NAVY Past Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Pak-NAVY-Past-Papers-MCQs-Quiz-Test.pdf", category: "PN Cadet" },
  { title: "Who is Who and What is What", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Who%20is%20who%20and%20waht%20is%20what%20by%20Dogar%20Brothers.pdf", category: "General Knowledge" },

  // Airmen
  { title: "English Prepositions Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/5-Complete-English-Prepositions-Book.pdf", category: "Airmen" },
  { title: "PAF Airman Guide", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/PAF%20Airman%20Guide%20by%20www-doc4shares-com.pdf", category: "Airmen" },
  { title: "PAF Test Prep Books", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/PAF%20Test%20Preparation%20Books%20By%20Jobs%20Test%20Preparation.pdf", category: "Airmen" },
  { title: "Interview Notes (Airman)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Interview%20Notes%20by%20doc4shares-com.pdf", category: "Airmen" },

  // General Intelligence
  { title: "Super Intelligence Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/Super%20Intelligence%20Book%20by%20Nazam%20Sattar%20Khokhar.pdf", category: "General Intelligence" },
  { title: "Non-Verbal Intelligence (Khokhar)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/Non-Verbal-Intelligence-by-Khokhar-brothers.pdf", category: "General Intelligence" },
  { title: "Verbal Intelligence Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf", category: "General Intelligence" },
  { title: "Non-Verbal Selection Guide", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf", category: "General Intelligence" },
  { title: "Non Verbal 3", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Non%20verbal%20(3).pdf", category: "General Intelligence" },
  { title: "Non Verbal 6", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pak%20Army%20Soldier/Non%20verbal%20(6).pdf", category: "General Intelligence" },

  // General / Common Notes
  { title: "English MCQs Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf", category: "General" },
  { title: "Pakistan Studies Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pakistan%20Studies%20Notes.pdf", category: "General" },
  { title: "Islamic Studies Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Islamic%20Studies%20Notes.pdf", category: "General" },
  { title: "General Knowledge Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf", category: "General" },
  { title: "Basic Maths Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf", category: "General" },
  { title: "Urdu Grammar Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Urdu%20Grammer%20Notes.pdf", category: "General" },
  
  // Science Group
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf", category: "Science" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf", category: "Science" },
  { title: "Physics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2011th%20Notes.pdf", category: "Science" },
  { title: "Physics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2012th%20notes.pdf", category: "Science" },
  { title: "Chemistry 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%209th%20Class%20Notes.pdf", category: "Science" },
  { title: "Chemistry 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2010th%20Notes%20(1).pdf", category: "Science" },
  { title: "Mathematics 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%209th%20Notes.pdf", category: "Science" },
  { title: "Mathematics 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2010th%20Notes.pdf", category: "Science" },
  { title: "Computer 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%209th%20Notes.pdf", category: "Science" },
  { title: "Chemistry MDCAT Guide", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/Torcia%20MDCAT%20Chemistry%20Preparation%20Book%20PDF.pdf", category: "MDCAT" },
  { title: "English Grammar MDCAT", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/KIPS%20KDP%20MDCAT%20English%20Grammar%20Practice%20Book%20PDF.pdf", category: "MDCAT" },
  { title: "Logical Reasoning MDCAT", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT/KIPS%20KDP%20Logical%20Reasoning%20MDCAT%202025%20Book%20PDF.pdf", category: "MDCAT" },
  { title: "PAF Intelligence Book 2", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Airman/PAF%20Intelligence%20Book%202.pdf", category: "General Intelligence" },
  { title: "Navy Initial Prep Book", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/PN%20cadet/Navy%20Initial%20Preparation%20Book.pdf", category: "PN Cadet" },
  { title: "Army Medical Cadet Papers", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/AFNS/Army%20Medical%20Cadet%20Past%20Papers.pdf", category: "AFNS" },
  { title: "ISSB Call Letter Info", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Related%20books/ISSB%20Call%20Letter%20Information.pdf", category: "General" },
];

export const STATIC_PDF_NOTES = [
  { title: "Physics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%209.pdf" },
  { title: "Physics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2010th%20Notes.pdf" },
  { title: "Physics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2011th%20Notes.pdf" },
  { title: "Physics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Physics%20Class%2012th%20notes.pdf" },
  { title: "Mathematics Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%209th%20Notes.pdf" },
  { title: "Mathematics Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2010th%20Notes.pdf" },
  { title: "Mathematics Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2011th%20Notes.pdf" },
  { title: "Mathematics Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Mathematics%20Class%2012th%20Notes.pdf" },
  { title: "Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Verbal%20Intelligence%20Notes.pdf" },
  { title: "Non-Verbal Intelligence Test", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/verbal-intelligence-test-vit-non-verbal-image-selection-guide.pdf" },
  { title: "English Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/English%20Mcqs%20Notes.pdf" },
  { title: "General Knowledge", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/General%20Knowledge%20Questions.pdf" },
  { title: "Islamic Studies (Islamiyat)", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Islamic%20Studies%20Notes.pdf" },
  { title: "Pakistan Studies", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Pakistan%20Studies%20Notes.pdf" },
  { title: "Basic Maths", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Basic%20Maths.pdf" },
  { title: "ASF Everyday Science", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/ASF%20EVERYDAY%20SCIENCE.pdf" },
  { title: "Urdu Grammar Notes", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Urdu%20Grammer%20Notes.pdf" },
  { title: "Biology Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Class%209th%20Mcqs%20Notes.pdf" },
  { title: "Biology Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Mcqs%20Class%2010th.pdf" },
  { title: "Biology Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%2011th%20Class.pdf" },
  { title: "Biology Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Biology%20Class%2012th%20Notes.pdf" },
  { title: "Chemistry Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%209th%20Class%20Notes.pdf" },
  { title: "Chemistry Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2010th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2011th%20Notes%20(1).pdf" },
  { title: "Chemistry Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Chemistry%20Class%2012th%20Notes.pdf" },
  { title: "Computer Class 9th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%209th%20Notes.pdf" },
  { title: "Computer Class 10th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%2010th%20Notes.pdf" },
  { title: "Computer Class 11th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%2011th%20Notes.pdf" },
  { title: "Computer Class 12th", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Computer%20Class%2012th%20Notes.pdf" },
  { title: "Most Common LAT Essay Topics", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/Most%20Common%20LAT%20Essay%20Topics.pdf" },
  { title: "LAT Personal Statements", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/LAT%20Personal%20Statements.pdf" },
  { title: "MDCAT Logical Reasoning Questions", url: "https://xdcutmgrkzbnivajfcsa.supabase.co/storage/v1/object/public/notes/MDCAT%20Logical%20Reasoning%20Questions.pdf" }
];

