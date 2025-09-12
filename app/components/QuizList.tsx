"use client"

import { useEffect, useState } from "react"
import MythListClient from "./MythListClient"

type Item = { id: string; text: string; fact?: string }

// STI myths and facts data from CSV
const STI_MYTHS_FACTS = [
  { myth: "You can't get an STI the first time you have sex.", fact: "Myth. You can get an STI any time you have sex with someone who has an STI." },
  { myth: "You can't get an STI from oral sex.", fact: "Myth. You can get an STI from any kind of sex, including oral sex." },
  { myth: "Using a male condom and a female condom together gives you double protection.", fact: "Myth. Male and female condoms should never be used together as they can break or fall out of place." },
  { myth: "Douching can help protect you from HIV.", fact: "Myth. Douching can actually increase risk by removing protective bacteria." },
  { myth: "You'll know if you have an STI because you'll have symptoms.", fact: "Myth. Many STIs are asymptomatic, meaning you could still be contagious without symptoms." },
  { myth: "Only teenagers get STIs.", fact: "Myth. Anyone can get STIs regardless of age." },
  { myth: "You can only get an STI if you have multiple partners.", fact: "Myth. It only takes one exposure to acquire an STI." },
  { myth: "If I'm pregnant with an STI, it won't affect my fetus.", fact: "Myth. Some STIs can cause complications during pregnancy and for the baby." },
  { myth: "Men and women have the same symptoms for STIs.", fact: "Myth. Symptoms can differ between men and women, and men often have no symptoms." },
  { myth: "All STIs can be cured.", fact: "Myth. Some STIs are curable, some are only manageable." },
  { myth: "STIs do not cause infertility.", fact: "Myth. Untreated STIs like chlamydia can lead to infertility, especially in women." },
  { myth: "Cold sores are an STI.", fact: "Fact. They can be caused by Herpes Simplex Virus, which can be transmitted sexually, but not always require sex to be transmitted." },
  { myth: "You can get an STI from a toilet seat.", fact: "Myth. STIs are not transmitted via toilet seats." },
  { myth: "Oral sex is safe sex.", fact: "Myth. STIs can still be transmitted by oral sex." },
  { myth: "You can always tell if someone has an STI.", fact: "Myth. Many infections have no visible symptoms; only testing can confirm." },
  { myth: "Only gay men get HIV.", fact: "Myth. Anyone who is sexually active can get HIV or an STI, regardless of sexual orientation." },
  { myth: "Pulling out before ejaculation is safe against STIs.", fact: "Myth. Pre-ejaculate and vaginal fluids can transmit STIs." },
  { myth: "HIV can be transmitted through any bodily fluid.", fact: "Myth. HIV is primarily transmitted via semen, blood, breast milk, and vaginal secretions, not via urine, saliva, or tears." }
];

export function TiltedScrollDemo() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    // Convert the static data to the expected format
    const mapped = STI_MYTHS_FACTS.map((item, index) => ({
      id: (index + 1).toString(),
      text: item.myth,
      fact: item.fact
    }));
    setItems(mapped);
  }, [])

  return <MythListClient items={items} />
}
