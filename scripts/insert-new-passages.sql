-- Insert new passages with updated word counts
-- Beginner: 15-25 words
-- Advanced: 25-30 words
-- Expert: 30-45 words

-- Beginner English Passages (15-25 words)
INSERT INTO passages (content, language, difficulty, length, status, generated_by, word_count)
VALUES
('The cat sat on the mat. It was a sunny day. Birds sang in the trees. The dog ran fast.', 'english', 'beginner', 'medium', 'ready', 'manual', 20),
('I like to read books. My favorite color is blue. The sun is bright today. We play in the park.', 'english', 'beginner', 'medium', 'ready', 'manual', 21),
('She walks to school every day. The flowers are pretty. He likes to eat apples. They run very fast together.', 'english', 'beginner', 'medium', 'ready', 'manual', 22),
('The sky is clear and blue. Birds fly high above. Children play outside happily. Dogs bark at the mailman today.', 'english', 'beginner', 'medium', 'ready', 'manual', 19),
('My friend has a new bike. We ride together after school. The weather is nice. Everyone is happy and smiling.', 'english', 'beginner', 'medium', 'ready', 'manual', 21);

-- Beginner Lao Passages (15-25 words)
INSERT INTO passages (content, language, difficulty, length, status, generated_by, word_count)
VALUES
('ມື້ນີ້ແມ່ນມື້ທີ່ດີ. ຟ້າແຈ່ມໃສ. ນົກຮ້ອງເພງຢູ່ເທິງຕົ້ນໄມ້. ແມວນອນຢູ່ເທິງເຕຍ.', 'lao', 'beginner', 'medium', 'ready', 'manual', 18),
('ຂ້ອຍຊອບອ່ານຫນັງສື. ສີທີ່ຂ້ອຍມັກແມ່ນສີຟ້າ. ແດດສ່ອງແສງສະຫວ່າງ. ພວກເຮົາຫຼິ້ນຢູ່ສວນສາທາລະນະ.', 'lao', 'beginner', 'medium', 'ready', 'manual', 17),
('ນາງຍ່າງໄປໂຮງຮຽນທຸກມື້. ດອກໄມ້ງາມຫຼາຍ. ລາວຊອບກິນໝາກໂປມ. ພວກເຂົາແລ່ນໄວຫຼາຍ.', 'lao', 'beginner', 'medium', 'ready', 'manual', 16),
('ທ້ອງຟ້າແຈ່ມໃສ. ນົກບິນສູງຂຶ້ນ. ເດັກນ້ອຍຫຼິ້ນຢູ່ນອກເຮືອນ. ໝາເຫົ່າໃສ່ຄົນສົ່ງຈົດໝາຍ.', 'lao', 'beginner', 'medium', 'ready', 'manual', 15),
('ເພື່ອນຂ້ອຍມີລົດຖີບໃໝ່. ພວກເຮົາຂີ່ລົດຖີບຮ່ວມກັນຫຼັງໂຮງຮຽນ. ອາກາດດີ. ທຸກຄົນມີຄວາມສຸກ.', 'lao', 'beginner', 'medium', 'ready', 'manual', 17);

-- Advanced English Passages (25-30 words)
INSERT INTO passages (content, language, difficulty, length, status, generated_by, word_count)
VALUES
('Technology has changed how we communicate and work. From smartphones to computers, digital tools help us stay connected. Learning to type quickly improves productivity and saves time every day.', 'english', 'advanced', 'medium', 'ready', 'manual', 30),
('Reading books opens new worlds and expands our imagination. Stories teach us about different cultures and perspectives. Libraries provide free access to knowledge for everyone in the community today.', 'english', 'advanced', 'medium', 'ready', 'manual', 29),
('Exercise keeps our bodies healthy and strong. Walking, running, and swimming are great activities. Regular physical activity improves mood and energy levels throughout the day for most people.', 'english', 'advanced', 'medium', 'ready', 'manual', 28),
('Cooking at home saves money and promotes healthy eating habits. Fresh ingredients make delicious meals. Learning basic recipes helps develop important life skills that benefit us forever.', 'english', 'advanced', 'medium', 'ready', 'manual', 27),
('Music brings people together across cultures and languages. Playing instruments or singing creates joy. Listening to different genres expands our appreciation for artistic expression and human creativity worldwide.', 'english', 'advanced', 'medium', 'ready', 'manual', 28);

-- Advanced Lao Passages (25-30 words)
INSERT INTO passages (content, language, difficulty, length, status, generated_by, word_count)
VALUES
('ເຕັກໂນໂລຊີໄດ້ປ່ຽນແປງວິທີການສື່ສານຂອງພວກເຮົາ. ຈາກໂທລະສັບມືຖືໄປຫາຄອມພິວເຕີ. ເຄື່ອງມືດິຈິຕອນຊ່ວຍໃຫ້ພວກເຮົາເຊື່ອມຕໍ່ກັນ. ການຮຽນຮູ້ການພິມໄວຊ່ວຍເພີ່ມປະສິດທິພາບ.', 'lao', 'advanced', 'medium', 'ready', 'manual', 26),
('ການອ່ານຫນັງສືເປີດໂລກໃໝ່ແລະຂະຫຍາຍຈິນຕະນາການ. ເລື່ອງຕ່າງໆສອນພວກເຮົາກ່ຽວກັບວັດທະນະທຳ. ຫໍສະໝຸດໃຫ້ການເຂົ້າເຖິງຄວາມຮູ້ຟຣີສຳລັບທຸກຄົນ.', 'lao', 'advanced', 'medium', 'ready', 'manual', 25),
('ການອອກກຳລັງກາຍຮັກສາຮ່າງກາຍໃຫ້ແຂງແຮງ. ການຍ່າງ ແລ່ນ ແລະ ລອຍນ້ຳແມ່ນກິດຈະກຳທີ່ດີ. ການອອກກຳລັງກາຍເປັນປະຈຳປັບປຸງອາລົມແລະພະລັງງານ.', 'lao', 'advanced', 'medium', 'ready', 'manual', 27),
('ການເຮັດອາຫານທີ່ເຮືອນປະຫຍັດເງິນແລະສົ່ງເສີມການກິນອາຫານທີ່ມີສຸຂະພາບດີ. ວັດຖຸດິບສົດເຮັດອາຫານແຊບ. ການຮຽນຮູ້ສູດອາຫານພື້ນຖານຊ່ວຍພັດທະນາທັກສະຊີວິດ.', 'lao', 'advanced', 'medium', 'ready', 'manual', 26),
('ດົນຕີນຳຜູ້ຄົນມາຮ່ວມກັນຂ້າມວັດທະນະທຳແລະພາສາ. ການຫຼິ້ນເຄື່ອງດົນຕີຫຼືຮ້ອງເພງສ້າງຄວາມສຸກ. ການຟັງປະເພດຕ່າງໆຂະຫຍາຍຄວາມຊື່ນຊົມສຳລັບການສະແດງອອກທາງສິລະປະ.', 'lao', 'advanced', 'medium', 'ready', 'manual', 28);

-- Expert English Passages (30-45 words with symbols & punctuation)
INSERT INTO passages (content, language, difficulty, length, status, generated_by, word_count)
VALUES
('Artificial intelligence & machine learning algorithms have become increasingly sophisticated! They enable computers to perform complex tasks: data analysis, pattern recognition, and decision-making. These technologies are transforming industries—from healthcare to finance—at an unprecedented rate (2020-2026).', 'english', 'expert', 'medium', 'ready', 'manual', 38),
('Climate change poses significant challenges for our planet''s future. Scientists warn that rising temperatures (1.5°C+) will impact ecosystems, weather patterns, and human societies. Immediate action—reducing emissions, protecting forests, and developing clean energy—is essential for sustainability.', 'english', 'expert', 'medium', 'ready', 'manual', 37),
('The internet has revolutionized communication & commerce worldwide! E-commerce platforms, social media networks, and streaming services have changed how we shop, connect, and consume content. Digital transformation continues to reshape business models—creating new opportunities while disrupting traditional industries.', 'english', 'expert', 'medium', 'ready', 'manual', 40),
('Space exploration represents humanity''s quest to understand the universe. Recent missions to Mars, the Moon, and beyond have yielded fascinating discoveries. Private companies like SpaceX & Blue Origin are making space travel more accessible—potentially enabling future colonization (2030s-2040s).', 'english', 'expert', 'medium', 'ready', 'manual', 41),
('Cybersecurity has become critical in our digital age! Hackers, malware, and data breaches threaten individuals & organizations daily. Strong passwords, two-factor authentication (2FA), and regular software updates are essential defenses. Protecting personal information requires constant vigilance—especially online.', 'english', 'expert', 'medium', 'ready', 'manual', 39);

-- Expert Lao Passages (30-45 words with symbols & punctuation)
INSERT INTO passages (content, language, difficulty, length, status, generated_by, word_count)
VALUES
('ປັນຍາປະດິດ & ການຮຽນຮູ້ຂອງເຄື່ອງຈັກໄດ້ກາຍເປັນທີ່ຊັບຊ້ອນຫຼາຍຂຶ້ນ! ເຮັດໃຫ້ຄອມພິວເຕີສາມາດປະຕິບັດວຽກງານທີ່ສັບຊ້ອນ: ການວິເຄາະຂໍ້ມູນ, ການຮັບຮູ້ຮູບແບບ, ແລະການຕັດສິນໃຈ. ເຕັກໂນໂລຊີເຫຼົ່ານີ້ກຳລັງປ່ຽນແປງອຸດສາຫະກຳ—ຕັ້ງແຕ່ການດູແລສຸຂະພາບໄປຈົນເຖິງການເງິນ—ໃນອັດຕາທີ່ບໍ່ເຄີຍມີມາກ່ອນ (2020-2026).', 'lao', 'expert', 'medium', 'ready', 'manual', 42),
('ການປ່ຽນແປງຂອງດິນຟ້າອາກາດເປັນສິ່ງທ້າທາຍສຳລັບອະນາຄົດຂອງໂລກ. ນັກວິທະຍາສາດເຕືອນວ່າອຸນຫະພູມທີ່ເພີ່ມຂຶ້ນ (1.5°C+) ຈະສົ່ງຜົນກະທົບຕໍ່ລະບົບນິເວດ. ການດຳເນີນການທັນທີ—ການຫຼຸດຜ່ອນການປ່ອຍອາຍພິດ, ການປົກປ້ອງປ່າໄມ້—ແມ່ນສຳຄັນ.', 'lao', 'expert', 'medium', 'ready', 'manual', 38),
('ອິນເຕີເນັດໄດ້ປະຕິວັດການສື່ສານ & ການຄ້າທົ່ວໂລກ! ເວທີການຄ້າອອນລາຍ, ເຄືອຂ່າຍສື່ສັງຄົມ, ແລະບໍລິການສະຕຣີມມິງໄດ້ປ່ຽນວິທີທີ່ພວກເຮົາຊື້ເຄື່ອງ. ການປ່ຽນແປງດິຈິຕອນສືບຕໍ່ປັບປຸງຮູບແບບທຸລະກິດ—ສ້າງໂອກາດໃໝ່.', 'lao', 'expert', 'medium', 'ready', 'manual', 36),
('ການສຳຫຼວດອະວະກາດເປັນຕົວແທນຂອງການສະແຫວງຫາຄວາມເຂົ້າໃຈຈັກກະວານ. ພາລະກິດຫຼ້າສຸດໄປດາວອັງຄານ, ດວງຈັນ ໄດ້ໃຫ້ການຄົ້ນພົບທີ່ໜ້າສົນໃຈ. ບໍລິສັດເອກະຊົນເຊັ່ນ SpaceX & Blue Origin ກຳລັງເຮັດໃຫ້ການເດີນທາງອະວະກາດເຂົ້າເຖິງໄດ້ງ່າຍຂຶ້ນ (2030s-2040s).', 'lao', 'expert', 'medium', 'ready', 'manual', 44),
('ຄວາມປອດໄພທາງອິນເຕີເນັດໄດ້ກາຍເປັນສິ່ງສຳຄັນໃນຍຸກດິຈິຕອນ! ແຮກເກີ, ມັນແວ, ແລະການລະເມີດຂໍ້ມູນເປັນໄພຂົ່ມຂູ່ບຸກຄົນ & ອົງກອນ. ລະຫັດຜ່ານທີ່ເຂັ້ມແຂງ, ການກວດສອບສອງປັດໃຈ (2FA) ແມ່ນການປ້ອງກັນທີ່ສຳຄັນ.', 'lao', 'expert', 'medium', 'ready', 'manual', 40);

-- Verify insertion
SELECT difficulty, language, COUNT(*) as count, AVG(word_count) as avg_words
FROM passages
GROUP BY difficulty, language
ORDER BY difficulty, language;
