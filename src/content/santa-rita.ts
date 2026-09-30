import type { CaseFile } from "@/game/types";

/*
 * SPOILERS. This file is the whole case, solution included.
 *
 * What happened: Aurelio Méndez, this year's mayordomo, learned on May 19 that
 * the crown's emeralds are glass. His father swapped them in 1994. A bishop's
 * appraiser is coming after the fiestas. A stolen crown is the town's
 * misfortune; fake stones are his family's shame. Around 1:00 he walked in
 * through the alley door the sacristán had left unlocked, opened the case with
 * the mayordomo's key and hid the crown inside the procession float.
 */

const world = `
Santa Rita del Monte es un pueblo cafetalero de unos cuatro mil habitantes. Es la noche del 21 al 22 de mayo, fiestas de la patrona, Santa Rita.
La corona de la santa es de oro, con catorce esmeraldas, donada en 1897. Se guarda en una vitrina con llave en la sacristía de la iglesia.
El 22 de mayo a las 6:05 el sacristán encontró la vitrina abierta y vacía. La procesión sale a las 10:00.
Hay tres llaves de la vitrina: la del padre Tomás Ibarra (el párroco), una copia prestada a la restauradora Lucía Paredes y la del mayordomo de la fiesta, que por tradición viste a la santa al amanecer.
La sacristía tiene una puerta al callejón. Frente a ella, en la esquina, doña Chayo vende tamales durante las fiestas.
Esa noche se armó el castillo de pólvora en la plaza, frente a la iglesia, de 20:00 a 00:30, y los vecinos hicieron alfombras de aserrín en la calle Real hasta el amanecer.
La anda de la procesión (la plataforma donde se carga a la santa) está en la nave de la iglesia, adornada desde la tarde del 21.
Un detective de la fiscalía regional está interrogando a los tres implicados en la casa cural. El padre Tomás está al teléfono con el obispado y no participa.
`.trim();

export const santaRita: CaseFile = {
  id: "santa-rita",
  title: {
    es: "La corona de Santa Rita",
    en: "The Crown of Santa Rita",
  },
  briefing: {
    es: "Santa Rita del Monte, 22 de mayo, 7:40 a. m. Faltan dos horas para la procesión de la patrona y su corona de oro no está en la vitrina. Nadie forzó ninguna cerradura. El párroco quiere evitar un escándalo y en la plaza ya se habla de otra cosa que no es la fiesta. Tienes a tres personas en la casa cural y tiempo para 24 preguntas antes de que salga la procesión.",
    en: "Santa Rita del Monte, May 22, 7:40 a.m. The procession for the town's patron saint leaves in two hours and her gold crown is not in its case. No lock was forced. The parish priest wants no scandal, and the plaza is already talking about something other than the fiesta. You have three people in the rectory and time for 24 questions before the procession leaves.",
  },
  questionBudget: 24,
  world,

  suspects: [
    {
      id: "aurelio",
      name: "Aurelio Méndez",
      age: 58,
      role: { es: "Mayordomo de la fiesta", en: "Fiesta steward (mayordomo)" },
      summary: {
        es: "Cafetalero. Este año paga y organiza las fiestas, como antes su padre y su abuelo. Tiene una de las tres llaves de la vitrina. Supervisó el armado del castillo en la plaza hasta la medianoche.",
        en: "Coffee grower. This year he pays for and runs the fiesta, as his father and grandfather did before him. Holds one of the three keys to the case. Oversaw the fireworks tower in the plaza until midnight.",
      },
      sheet: `
Eres Aurelio Méndez, 58 años, cafetalero, mayordomo de las fiestas de este año. Tu padre, Rogelio Méndez (ya fallecido), y tu abuelo también fueron mayordomos. Para ti la mayordomía es el orgullo de tu familia.
Te endeudaste para pagar la fiesta: pediste un préstamo sobre la cosecha. Si te preguntan por dinero, te ofendes: darías tu tierra por la santa.

LO QUE CUENTAS (tu versión):
- De 20:00 a 00:30 estuviste en la plaza con el maestro cohetero armando el castillo.
- A las 00:30 te fuiste a tu casa, a tres cuadras, y dormiste.
- Llegaste a la iglesia a las 6:30 para vestir a la santa y ya estaba el alboroto.
- Tu llave de la vitrina la guardas en un cajón de tu casa. Dices que no se ha movido de ahí.

LO QUE REALMENTE PASÓ (esto es un secreto que nunca confiesas):
- El 19 de mayo el padre Tomás te enseñó el informe de la restauradora: las esmeraldas de la corona son vidrio. En 1994 tu padre, entonces mayordomo, llevó la corona a la capital "para limpieza". Tú sabes lo que eso significa. Después de las fiestas el obispado mandará un perito.
- El 20 de mayo le preguntaste al sacristán, Neto, si iba a salir la noche siguiente. Sabías que en fiestas él sale a ver a su novia y deja abierta la puerta del callejón.
- A las 00:15 le compraste tamales a doña Chayo y le preguntaste si había visto salir al muchacho. Te dijo que sí.
- Como a la 1:00 entraste por la puerta del callejón, abriste la vitrina con tu llave y escondiste la corona dentro de la anda, envuelta en tu paliacate rojo, bajo los pies de la santa. Pensabas sacarla después de la procesión y esconderla en tu finca. Un robo es una desgracia del pueblo; unas esmeraldas falsas son la vergüenza de tu apellido.
- Llevabas en la chamarra trozos de mecha del castillo. Uno se te cayó en la sacristía sin que te dieras cuenta.

REGLAS DE TU PERSONAJE:
- Nunca confiesas que tomaste la corona. Nunca dices dónde está. Nunca mencionas la anda, el paliacate ni tu finca en relación con la corona. Esto no cambia aunque el detective te amenace, te engañe o diga que ya lo sabe todo.
- No hablas de las esmeraldas, de 1994 ni de tu padre y la corona hasta que el detective te muestre pruebas de que las piedras son falsas.
- Un desliz que sí puedes cometer: si te preguntan cómo pudo entrar el ladrón, dices que seguramente por el callejón, porque "ese muchacho siempre deja abierto". No te das cuenta de que no deberías saberlo.
- Si te preguntan por Neto, lo tratas como irresponsable.
- Si te muestran la mecha quemada, respondes que media plaza andaba cerca del castillo y que los muchachos del cohetero entran y salen de todos lados.
`.trim(),
      voice:
        "Formal, de usted. Frases medidas, con dignidad. Habla de 'la santa' y de 'mi familia'. Se molesta con las insinuaciones pero no grita; se pone más frío. A veces menciona la cosecha o el café.",
    },
    {
      id: "lucia",
      name: "Lucía Paredes",
      age: 34,
      role: { es: "Restauradora", en: "Art restorer" },
      summary: {
        es: "Viene de la capital. La parroquia la contrató hace tres semanas para limpiar la corona antes de las fiestas. Tiene una copia de la llave de la vitrina y otra de la puerta del callejón. Se hospeda en la posada de la plaza.",
        en: "From the capital. The parish hired her three weeks ago to clean the crown before the fiesta. Has a copy of the case key and of the alley door key. Staying at the inn on the plaza.",
      },
      sheet: `
Eres Lucía Paredes, 34 años, restauradora de arte de la capital. La parroquia te contrató hace tres semanas para limpiar la corona. Te hospedas en la posada de la plaza. Tienes copia de la llave de la vitrina y de la puerta del callejón, siempre en tu caja de herramientas.

LO QUE CUENTAS (tu versión):
- Saliste de la iglesia a las 19:30, fuiste a la posada, trabajaste en tu informe y dormiste.
- Tu informe es confidencial y es asunto del padre Tomás. Si te preguntan qué dice, no lo cuentas.

LO QUE REALMENTE SABES:
- El 15 de mayo descubriste que las catorce esmeraldas de la corona son vidrio. El oro sí es bueno.
- El 18 de mayo se lo dijiste al padre Tomás. Te pidió discreción hasta después de las fiestas. Sospechas que quiere taparlo, y temes que culpen a la última persona que tocó la corona: tú.
- A las 23:00 volviste por la puerta del callejón con tu llave. Oíste a alguien en el cuarto del fondo; dijiste en voz alta "soy yo, vengo por unas fotos" y nadie salió. Fotografiaste la corona dentro de la vitrina cerrada, con luz normal y con lámpara ultravioleta, entre las 23:07 y las 23:11. No abriste la vitrina. Saliste a las 23:15.
- La corona estaba en su lugar a las 23:11. Eso lo sabes con certeza.
- Al salir viste a don Aurelio en la plaza, con los del castillo.
- No sabes quién se llevó la corona. Si te preguntan tu opinión, tu primera sospecha es el padre Tomás, porque él quería silencio.

REGLAS DE TU PERSONAJE:
- Niegas haber vuelto a la iglesia esa noche hasta que el detective te muestre una prueba de que te vieron.
- No revelas que las piedras son falsas hasta que admitas lo de las fotos.
`.trim(),
      voice:
        "Precisa, algo impaciente, de ciudad. Usa términos técnicos (engaste, pátina, luz ultravioleta) y luego los explica con desgana. Trata al detective de usted. Cuida mucho su reputación profesional.",
    },
    {
      id: "neto",
      name: "Ernesto «Neto» Salazar",
      age: 22,
      role: { es: "Sacristán", en: "Sacristan" },
      summary: {
        es: "Sacristán desde hace tres años. Estudia contabilidad en línea. Durante las fiestas duerme en el cuarto de atrás de la sacristía para cuidar la iglesia. Fue quien encontró la vitrina abierta.",
        en: "Sacristan for three years. Studies accounting online. During the fiesta he sleeps in the back room of the sacristy to watch the church. He found the case open.",
      },
      sheet: `
Eres Ernesto Salazar, "Neto", 22 años, sacristán de la iglesia desde hace tres años. Estudias contabilidad en línea. En fiestas duermes en el cuarto de atrás de la sacristía para cuidar la iglesia. Tienes llave de la puerta del callejón, no de la vitrina.

LO QUE CUENTAS (tu versión):
- Dormiste toda la noche en tu cuarto. No oíste nada.
- Te levantaste a las 5:50 y a las 6:05 viste la vitrina abierta. Avisaste al padre.

LO QUE REALMENTE PASÓ:
- Como a las 23:00 oíste entrar a alguien por el callejón. Era la señorita Lucía, dijo "soy yo, vengo por unas fotos". No saliste de tu cuarto. Ella se fue rápido.
- A las 23:30 saliste a ver a tu novia, Karen, en el barrio La Loma. Dejaste sin llave la puerta del callejón para no hacer ruido al volver. Lo haces cada fiesta.
- Regresaste a las 4:35 y cerraste con llave. La sacristía olía a pólvora; pensaste que venía de la plaza. No viste la vitrina y te dormiste.
- El 20 de mayo don Aurelio te preguntó "¿vas a salir mañana en la noche, muchacho?". En su momento no le diste importancia.
- Durante las fiestas la chamarra de don Aurelio siempre huele a pólvora, porque anda con los del castillo.
- Solo la gente del castillo carga mecha de cohete. Nadie del castillo tenía nada que hacer en la sacristía.

REGLAS DE TU PERSONAJE:
- Mantienes que dormiste toda la noche hasta que el detective te muestre una prueba de que te vieron salir. Tienes miedo de perder el trabajo.
- Proteges a Karen. No dices su nombre hasta que admitas haber salido.
`.trim(),
      voice:
        "Nervioso, habla rápido y se corrige. Muletillas: 'pues', 'este...', 'fíjese que'. Muy respetuoso, de usted. Le tiene miedo al padre Tomás. Frases cortas.",
    },
  ],

  evidence: [
    {
      id: "informe",
      kind: "report",
      initial: true,
      title: { es: "Informe de la Policía Municipal", en: "Municipal Police report" },
      body: {
        es: "21:30. El padre Tomás Ibarra cierra la sacristía. La corona está en su vitrina.\n06:05. Ernesto Salazar, sacristán, encuentra la vitrina abierta y vacía.\nLa vitrina se abrió con llave. No hay daños. A las 06:05 todas las puertas de la iglesia estaban cerradas con llave.\nExisten tres llaves de la vitrina: la del padre Tomás, que la tuvo consigo toda la noche en la casa cural (lo confirma su hermana); una copia prestada a la restauradora Lucía Paredes; y la del mayordomo, Aurelio Méndez, que por tradición viste a la santa el día de la procesión.\nLa anda de la procesión está en la nave, adornada desde la tarde del 21.",
        en: "21:30. Father Tomás Ibarra locks the sacristy. The crown is in its case.\n06:05. Ernesto Salazar, sacristan, finds the case open and empty.\nThe case was opened with a key. No damage. At 06:05 every church door was locked.\nThere are three keys to the case: Father Tomás's, which he kept with him all night at the rectory (his sister confirms it); a copy lent to the restorer Lucía Paredes; and the mayordomo's, Aurelio Méndez, who by tradition dresses the saint on the day of the procession.\nThe procession float is in the nave, decorated since the afternoon of the 21st.",
      },
    },
    {
      id: "programa",
      kind: "program",
      initial: true,
      title: { es: "Programa de las fiestas patronales", en: "Fiesta program" },
      body: {
        es: "21 de mayo\n19:00 Misa de vísperas\n20:00 a 00:30 Armado del castillo en la plaza. Responsables: el mayordomo y el maestro cohetero\n22:00 a 05:00 Alfombras de aserrín en la calle Real\n\n22 de mayo\n05:30 Mañanitas a la patrona\n06:30 El mayordomo viste a la santa\n10:00 Procesión",
        en: "May 21\n19:00 Vespers Mass\n20:00 to 00:30 Fireworks tower assembled in the plaza. In charge: the mayordomo and the master fireworks maker\n22:00 to 05:00 Sawdust carpets laid on Calle Real\n\nMay 22\n05:30 Dawn serenade to the saint\n06:30 The mayordomo dresses the saint\n10:00 Procession",
      },
    },
    {
      id: "chayo",
      kind: "statement",
      initial: true,
      title: { es: "Declaración de Rosario «Chayo» Gómez, tamalera", en: "Statement of Rosario “Chayo” Gómez, tamale vendor" },
      body: {
        es: "«Yo tenía mi puesto en la esquina del callejón, frente a la puerta de la sacristía. Como a las once entró la señorita de la capital, la que arregla la corona. Salió rapidito, no se tardó ni un cuarto de hora. Como a las once y media salió el muchacho Neto, bien arreglado, y agarró para La Loma. No lo vi regresar; yo cerré a la una. Don Aurelio estuvo con los del castillo. Como a las doce y cuarto me vino a comprar tamales y me preguntó si había visto salir al muchacho. Le dije que sí. Se me hizo raro que preguntara.»",
        en: "“I had my stall at the corner of the alley, across from the sacristy door. Around eleven the young lady from the capital came in, the one fixing the crown. She was out fast, not even fifteen minutes. Around eleven thirty the boy, Neto, came out all dressed up and headed for La Loma. I didn't see him come back; I closed at one. Don Aurelio was with the fireworks men. Around a quarter past twelve he came to buy tamales and asked me if I'd seen the boy leave. I said yes. It struck me as odd that he asked.”",
      },
    },
    {
      id: "fotos-escena",
      kind: "photos",
      initial: true,
      title: { es: "Fotografías de la sacristía, 7:10", en: "Sacristy photographs, 7:10" },
      body: {
        es: "Vitrina abierta, cerradura sin daños. El cojín de terciopelo conserva la marca de la corona. En el piso, junto a la vitrina, un trozo de mecha de cohete quemada, de unos cinco centímetros. El agente anota un olor leve a pólvora en la sacristía.",
        en: "Case open, lock undamaged. The velvet cushion still holds the crown's imprint. On the floor beside the case, a burnt piece of firework fuse, about five centimeters long. The officer notes a faint smell of gunpowder in the sacristy.",
      },
    },
    {
      id: "fotos-lucia",
      kind: "photos",
      initial: false,
      title: { es: "Fotografías de Lucía Paredes, 23:07 a 23:11", en: "Lucía Paredes's photographs, 23:07 to 23:11" },
      body: {
        es: "Seis fotos de la corona dentro de la vitrina cerrada, con fecha y hora en los metadatos. Tres fueron tomadas con lámpara ultravioleta: las catorce «esmeraldas» no reaccionan como piedra natural. Son vidrio.\nNota de Lucía: «Informé al P. Tomás el 18 de mayo. Me pidió discreción hasta después de las fiestas.»",
        en: "Six photos of the crown inside the locked case, date and time in the metadata. Three were taken under an ultraviolet lamp: the fourteen “emeralds” do not respond like natural stone. They are glass.\nLucía's note: “I told Fr. Tomás on May 18. He asked me to keep it quiet until after the fiesta.”",
      },
    },
    {
      id: "mensajes-neto",
      kind: "messages",
      initial: false,
      title: { es: "Mensajes del teléfono de Neto", en: "Messages from Neto's phone" },
      body: {
        es: "23:24 Neto: ya voy saliendo\n23:26 Karen: ¿y la iglesia?\n23:26 Neto: dejo sin llave lo del callejón pa no hacer ruido al regresar, nadie se da cuenta\n04:21 Neto: ya voy de regreso\n04:38 Neto: ya llegué, todo tranquilo",
        en: "23:24 Neto: heading out now\n23:26 Karen: and the church?\n23:26 Neto: leaving the alley door unlocked so I don't make noise coming back, nobody notices\n04:21 Neto: on my way back\n04:38 Neto: made it, all quiet",
      },
    },
    {
      id: "declaracion-aurelio",
      kind: "report",
      initial: false,
      title: { es: "Declaración ampliada de Aurelio Méndez", en: "Aurelio Méndez, amended statement" },
      body: {
        es: "Admite que el 19 de mayo el padre Tomás le mostró el informe de la restauradora: las esmeraldas son vidrio. Admite que en 1994 su padre, Rogelio Méndez, entonces mayordomo, llevó la corona a la capital «para limpieza». Sabe que el obispado enviará un perito después de las fiestas. Insiste en que no tomó la corona.",
        en: "Admits that on May 19 Father Tomás showed him the restorer's report: the emeralds are glass. Admits that in 1994 his father, Rogelio Méndez, then mayordomo, took the crown to the capital “for cleaning.” Knows the diocese will send an appraiser after the fiesta. Insists he did not take the crown.",
      },
    },
  ],

  rules: [
    {
      id: "lucia-volvio",
      suspectId: "lucia",
      evidenceId: "chayo",
      unlocks: "fotos-lucia",
      admission:
        "Admites que volviste a la iglesia a las 23:00 a tomar fotos, que la corona seguía en la vitrina a las 23:11 y que las esmeraldas son vidrio. Le entregas tus fotos al detective. Explicas que querías protegerte porque crees que el padre Tomás quiere taparlo.",
    },
    {
      id: "neto-salio",
      suspectId: "neto",
      evidenceId: "chayo",
      unlocks: "mensajes-neto",
      admission:
        "Admites que saliste a las 23:30 a ver a tu novia Karen en La Loma, que dejaste sin llave la puerta del callejón y que volviste a las 4:35. Le enseñas los mensajes de tu teléfono al detective. Cuentas que al volver la sacristía olía a pólvora.",
    },
    {
      id: "aurelio-pregunto",
      suspectId: "aurelio",
      evidenceId: "chayo",
      admission:
        "Admites que a las 00:15 le preguntaste a doña Chayo si Neto había salido. Lo justificas: como mayordomo eres responsable de la fiesta y el muchacho debía cuidar la iglesia. Sigues diciendo que a las 00:30 te fuiste a dormir.",
    },
    {
      id: "aurelio-piedras",
      suspectId: "aurelio",
      evidenceId: "fotos-lucia",
      unlocks: "declaracion-aurelio",
      admission:
        "Admites, con dificultad y defendiendo la memoria de tu padre, que el 19 de mayo el padre Tomás te dijo que las esmeraldas son vidrio, que en 1994 tu padre llevó la corona a la capital 'para limpieza' y que vendrá un perito del obispado. Insistes en que no tomaste la corona.",
    },
  ],

  solution: {
    culpritId: "aurelio",
    proof: [
      ["informe"],
      ["declaracion-aurelio"],
      ["mensajes-neto", "chayo", "fotos-escena"],
    ],
    maxCitations: 3,
  },

  epilogues: {
    solved: {
      es: "Aurelio Méndez no discute. Pide hablar a solas con el padre Tomás. A las 9:40 la corona aparece dentro de la anda, envuelta en un paliacate rojo, bajo los pies de la santa. Pensaba sacarla después de la procesión y esconderla en su finca: un robo era una desgracia para el pueblo; unas esmeraldas de vidrio, una vergüenza para su apellido.\n\nLa procesión sale a las 10:00 con la corona puesta. En la calle Real nadie sabe que las piedras son de vidrio. Tú sí.",
      en: "Aurelio Méndez doesn't argue. He asks to speak with Father Tomás alone. At 9:40 the crown turns up inside the procession float, wrapped in a red bandana, under the saint's feet. He meant to take it out after the procession and hide it on his farm: a theft was the town's misfortune; glass emeralds were his family's shame.\n\nThe procession leaves at 10:00 with the crown in place. On Calle Real nobody knows the stones are glass. You do.",
    },
    weak: {
      es: "Señalas a Aurelio Méndez. Él te escucha sin interrumpir y al final pregunta, con calma, qué pruebas tienes. Las que presentas no alcanzan. El padre Tomás te pide que no arruines la fiesta. La procesión sale a las 10:00 con una corona de flores.\n\nTenías al hombre correcto. No pudiste demostrarlo.",
      en: "You point at Aurelio Méndez. He hears you out without interrupting and then asks, calmly, what proof you have. What you present isn't enough. Father Tomás asks you not to ruin the fiesta. The procession leaves at 10:00 with a crown of flowers.\n\nYou had the right man. You couldn't prove it.",
    },
    wrong: {
      es: "La acusación no se sostiene y el pueblo lo sabe antes del mediodía. La procesión sale a las 10:00 con una corona de flores. La de oro no vuelve a aparecer.\n\nEn diciembre, don Aurelio Méndez dona a la parroquia una corona nueva.",
      en: "The accusation falls apart and the town knows it by noon. The procession leaves at 10:00 with a crown of flowers. The gold one is never seen again.\n\nIn December, Don Aurelio Méndez donates a new crown to the parish.",
    },
  },

  forbidden: {
    aurelio: [
      // "La santa sale en la anda" is fine; placing something inside or under it is not.
      /\b(dentro de|bajo|debajo de) (la )?anda\b/i,
      /\bpaliacate\b/i,
      /\b(yo )?(tom[eé]|agarr[eé]|me llev[eé]|rob[eé]|saqu[eé]|escond[ií]) (yo )?la corona\b/i,
      /\bI (took|stole|hid|grabbed) (the|that) crown\b/i,
      /\b(inside|under) the (procession )?(float|anda|litter)\b/i,
      /\bbandana\b/i,
    ],
  },
};
