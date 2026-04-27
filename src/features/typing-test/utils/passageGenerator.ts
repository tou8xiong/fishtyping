"use client";

import { createClient } from "@/lib/supabase/client";
import { getAvailablePassage, releasePassage, savePassageHistory } from "@/lib/supabase/db";
import type { Difficulty, Length, Language, Passage, Theme, ChallengeType } from "@/lib/supabase/types";
import { WORD_COUNT_BY_DIFFICULTY } from "@/lib/supabase/types";

export type { Difficulty, Length, Language, Passage, Theme, ChallengeType };
export { WORD_COUNT_BY_DIFFICULTY };

export async function fetchPassageFromDB(params: {
  difficulty?: Difficulty;
  length?: Length;
  language?: Language;
}): Promise<Passage | null> {
  try {
    return await getAvailablePassage({
      difficulty: params.difficulty || 'beginner',
      length: params.length || 'medium',
      language: params.language || 'english',
    });
  } catch {
    return null;
  }
}

export async function returnPassageToPool(passageId: string): Promise<void> {
  try {
    await releasePassage(passageId);
  } catch {
    // Silently fail if DB is unavailable
  }
}

export async function trackPassageResult(data: {
  passageId: string;
  difficulty: Difficulty;
  wpm: number;
  accuracy: number;
  durationMs: number;
}): Promise<void> {
  try {
    if (typeof window === "undefined") {
      console.log('trackPassageResult: window is undefined');
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('trackPassageResult: No user logged in');
      return;
    }

    console.log('trackPassageResult: Saving passage history', {
      userId: user.id,
      passageId: data.passageId,
      difficulty: data.difficulty,
      wpm: data.wpm,
      accuracy: data.accuracy,
      durationMs: data.durationMs,
    });

    await savePassageHistory({
      userId: user.id,
      passageId: data.passageId,
      difficulty: data.difficulty,
      wpm: data.wpm,
      accuracy: data.accuracy,
      durationMs: data.durationMs,
    });

    console.log('trackPassageResult: Successfully saved passage history');
  } catch (error) {
    console.error('trackPassageResult: Error saving passage history', error);
  }
}

// Default passages for each difficulty level
export const DEFAULT_PASSAGES = {
  beginner: {
    english: "The cat sat on the mat. It was a sunny day. Birds sang in the trees. The dog ran fast.",
    lao: "ມື້ນີ້ແມ່ນມື້ທີ່ດີ. ຟ້າແຈ່ມໃສ. ນົກຮ້ອງເພງຢູ່ເທິງຕົ້ນໄມ້. ແມວນອນຢູ່ເທິງເຕຍ."
  },
  advanced: {
    english: "Technology has changed how we communicate and work. From smartphones to computers, digital tools help us stay connected. Learning to type quickly improves productivity and saves time every day.",
    lao: "ເຕັກໂນໂລຊີໄດ້ປ່ຽນແປງວິທີການສື່ສານຂອງພວກເຮົາ. ຈາກໂທລະສັບມືຖືໄປຫາຄອມພິວເຕີ. ເຄື່ອງມືດິຈິຕອນຊ່ວຍໃຫ້ພວກເຮົາເຊື່ອມຕໍ່ກັນ. ການຮຽນຮູ້ການພິມໄວຊ່ວຍເພີ່ມປະສິດທິພາບ."
  },
  expert: {
    english: "Artificial intelligence & machine learning algorithms have become increasingly sophisticated! They enable computers to perform complex tasks: data analysis, pattern recognition, and decision-making. These technologies are transforming industries—from healthcare to finance—at an unprecedented rate (2020-2026).",
    lao: "ປັນຍາປະດິດ & ການຮຽນຮູ້ຂອງເຄື່ອງຈັກໄດ້ກາຍເປັນທີ່ຊັບຊ້ອນຫຼາຍຂຶ້ນ! ເຮັດໃຫ້ຄອມພິວເຕີສາມາດປະຕິບັດວຽກງານທີ່ສັບຊ້ອນ: ການວິເຄາະຂໍ້ມູນ, ການຮັບຮູ້ຮູບແບບ, ແລະການຕັດສິນໃຈ. ເຕັກໂນໂລຊີເຫຼົ່ານີ້ກຳລັງປ່ຽນແປງອຸດສາຫະກຳ—ຕັ້ງແຕ່ການດູແລສຸຂະພາບໄປຈົນເຖິງການເງິນ—ໃນອັດຕາທີ່ບໍ່ເຄີຍມີມາກ່ອນ (2020-2026)."
  }
} as const;
