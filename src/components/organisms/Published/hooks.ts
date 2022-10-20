import { mapValues } from "lodash-es";
import { useState, useMemo, useEffect } from "react";

import type {
  Layer,
  Widget,
  Block,
  WidgetAlignSystem,
  Alignment,
  ClusterProperty,
} from "@reearth/components/molecules/Visualizer";

import { PublishedData, WidgetZone, WidgetSection, WidgetArea, Layer as RawLayer } from "./types";

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const sceneProperty = processProperty(data?.property);
  const pluginProperty = Object.keys(data?.plugins ?? {}).reduce<{ [key: string]: any }>(
    (a, b) => ({ ...a, [b]: processProperty(data?.plugins?.[b]?.property) }),
    {},
  );
  const clusterProperty = useMemo<ClusterProperty[]>(
    () => data?.clusters?.map(a => ({ ...processProperty(a.property), id: a.id })) ?? [],
    [data],
  );

  const rootLayer = useMemo(() => {
    return {
      id: "",
      children: data?.layers?.map(processLayer) ?? [],
    };
  }, [data]);

  const tags = data?.tags; // Currently no need to convert tags

  const widgets = useMemo<
    { floatingWidgets: Widget[]; alignSystem: WidgetAlignSystem | undefined } | undefined
  >(() => {
    if (!data || !data.widgets) return undefined;

    const widgetsInWas = new Set<string>();
    if (data.widgetAlignSystem) {
      for (const z of ["inner", "outer"] as const) {
        for (const s of ["left", "center", "right"] as const) {
          for (const a of ["top", "middle", "bottom"] as const) {
            for (const w of data.widgetAlignSystem?.[z]?.[s]?.[a]?.widgetIds ?? []) {
              widgetsInWas.add(w);
            }
          }
        }
      }
    }

    const floatingWidgets = data?.widgets
      .filter(w => !widgetsInWas.has(w.id))
      .map(
        (w): Widget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property),
        }),
      );

    const widgets = data?.widgets
      .filter(w => widgetsInWas.has(w.id))
      .map(
        (w): Widget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property),
        }),
      );

    const widgetZone = (zone?: WidgetZone | null) => {
      const left = widgetSection(zone?.left);
      const center = widgetSection(zone?.center);
      const right = widgetSection(zone?.right);
      if (!left && !center && !right) return;
      return {
        left,
        center,
        right,
      };
    };

    const widgetSection = (section?: WidgetSection | null) => {
      const top = widgetArea(section?.top);
      const middle = widgetArea(section?.middle);
      const bottom = widgetArea(section?.bottom);
      if (!top && !middle && !bottom) return;
      return {
        top,
        middle,
        bottom,
      };
    };

    const widgetArea = (area?: WidgetArea | null) => {
      const align = area?.align.toLowerCase() as Alignment | undefined;
      const areaWidgets: Widget[] | undefined = area?.widgetIds
        .map<Widget | undefined>(w => widgets?.find(w2 => w === w2.id))
        .filter((w): w is Widget => !!w);
      if (!areaWidgets || areaWidgets.length < 1) return;
      return {
        align: align ?? "start",
        widgets: areaWidgets,
      };
    };

    return {
      floatingWidgets,
      alignSystem: data.widgetAlignSystem
        ? {
            outer: widgetZone(data.widgetAlignSystem.outer),
            inner: widgetZone(data.widgetAlignSystem.inner),
          }
        : undefined,
    };
  }, [data]);

  const actualAlias = useMemo(
    () => alias || new URLSearchParams(window.location.search).get("alias") || undefined,
    [alias],
  );

  useEffect(() => {
    const url = dataUrl(actualAlias);
    (async () => {
      try {
        const res = await fetch(url, {});
        if (res.status >= 300) {
          setError(true);
          return;
        }
        const d = testdata;
        if (d?.schemaVersion !== 1) {
          // TODO: not supported version
          return;
        }

        // For compability: map tiles are not shown by default
        if (
          new Date(d.publishedAt) < new Date(2021, 0, 13, 18, 20, 0) &&
          (!d?.property?.tiles || d.property.tiles.length === 0)
        ) {
          d.property = {
            ...d.property,
            tiles: [{ id: "___default_tile___" }],
          };
        }

        setData(d);
      } catch (e) {
        // TODO: display error for users
        console.error(e);
      } finally {
        setReady(true);
      }
    })();
  }, [actualAlias]);

  return {
    alias: actualAlias,
    sceneProperty,
    pluginProperty,
    rootLayer,
    tags,
    clusterProperty,
    widgets,
    ready,
    error,
  };
};

function processLayer(l: RawLayer): Layer {
  return {
    id: l.id,
    title: l.name || "",
    pluginId: l.pluginId,
    extensionId: l.extensionId,
    isVisible: l.isVisible ?? true,
    propertyId: l.propertyId,
    property: processProperty(l.property),
    infobox: l.infobox
      ? {
          property: processProperty(l.infobox.property),
          blocks: l.infobox.fields.map<Block>(f => ({
            id: f.id,
            pluginId: f.pluginId,
            extensionId: f.extensionId,
            property: processProperty(f.property),
          })),
        }
      : undefined,
    tags: l.tags, // Currently no need to convert tags
    children: l.children?.map(processLayer),
  };
}

function processProperty(p: any): any {
  if (typeof p !== "object") return p;
  return mapValues(p, g =>
    Array.isArray(g) ? g.map(h => processPropertyGroup(h)) : processPropertyGroup(g),
  );
}

function processPropertyGroup(g: any): any {
  if (typeof g !== "object") return g;
  return mapValues(g, v => {
    // For compability
    if (Array.isArray(v)) {
      return v.map(vv =>
        typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v
          ? { ...vv, height: vv.altitude }
          : vv,
      );
    }
    if (typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v) {
      return {
        ...v,
        height: v.altitude,
      };
    }
    return v;
  });
}

function dataUrl(alias?: string): string {
  if (alias && window.REEARTH_CONFIG?.api) {
    return `${window.REEARTH_CONFIG.api}/published_data/${alias}`;
  }
  return "data.json";
}

const testdata = {
  schemaVersion: 1,
  id: "01gegmpbfsc8wnfzh5zsafj38n",
  publishedAt: "2022-10-20T02:58:40.255150882Z",
  property: {
    atmosphere: {
      shadows: false,
    },
    cameraLimiter: {
      cameraLimitterEnabled: false,
      cameraLimitterShowHelper: false,
      cameraLimitterTargetArea: {
        lat: 35.65781860158026,
        lng: 139.6856695038083,
        altitude: 152.2299328268945,
        heading: 5.532150593678547,
        pitch: -0.23124749783363385,
        roll: 3.942703941106629e-9,
        fov: 1.0471975511965976,
      },
    },
    default: {
      skybox: false,
      terrain: true,
    },
    indicator: {
      indicator_type: "default",
    },
    tiles: [
      {
        id: "01gegmpbfsc8wnfzh5zyd6pp62",
        tile_type: "open_street_map",
      },
    ],
  },
  plugins: {},
  layers: [
    {
      id: "01gf5zshz7e2pwbp3zv4gqdvpa",
      pluginId: "reearth",
      extensionId: "tileset",
      name: "3Dタイル",
      propertyId: "01gf5zshz7e2pwbp3zv77s601y",
      property: {
        default: {
          shadows: "disabled",
          styleUrl: "https://static.reearth.io/assets/01gepbag5bxzbkcefxarxtnmza.json",
          tileset:
            "https://plateau.geospatial.jp/main/data/3d-tiles/bldg/13100_tokyo/13110_meguro-ku/notexture/tileset.json",
        },
      },
      isVisible: true,
    },
    {
      id: "01gensmb78npajhhmcprf3pwkz",
      pluginId: "reearth",
      extensionId: "marker",
      name: "221006_緑の散歩道_csv用 - 01駒場コース.csv",
      propertyId: "01gensmb78npajhhmcpvrz4mkc",
      property: {
        default: {
          extrude: false,
          height: 30,
          heightReference: "relative",
          imageShadowBlur: 0,
          label: false,
          location: null,
        },
      },
      infobox: {
        fields: [
          {
            id: "01gensq68hdxj5j4ysddtn5dpy",
            pluginId: "reearth",
            extensionId: "textblock",
            property: {
              default: {
                markdown: true,
                text: null,
              },
            },
          },
        ],
        property: {
          default: {
            bgcolor: null,
            outlineColor: null,
            outlineWidth: 3,
            size: "medium",
            title: null,
            typography: {
              fontFamily: null,
              fontWeight: null,
              fontSize: null,
              color: "#4d4d4dff",
              textAlign: null,
              bold: null,
              italic: null,
              underline: null,
            },
          },
        },
      },
      isVisible: true,
      children: [
        {
          id: "01gensmb78npajhhmcq0dqz25x",
          pluginId: "reearth",
          extensionId: "marker",
          name: "00.駒場コース Komaba Course",
          propertyId: "01gensmb78npajhhmcq1w6spha",
          property: {
            default: {
              extrude: false,
              height: 20,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtesfa8tb5rtprkdcd3sb.png",
              imageShadowBlur: 0,
              imageSize: 0.4,
              label: false,
              labelText: "下へ続く",
              labelTypography: {
                fontFamily: "YuGothic",
                fontWeight: null,
                fontSize: null,
                color: "#1f0202",
                textAlign: null,
                bold: null,
                italic: null,
                underline: null,
              },
              location: {
                lat: 35.658678,
                lng: 139.684408,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "## 駒場野の自然と文学の径\nPath of Nature and Literature in Komabano  \n\nむかしむかし駒場野は、人の背たけほどある笹が一面に生い茂った広大な原野でした。将軍家の御鷹場、そして軍隊の駐屯地となり、現在は文化の香り高いまちとなった駒場。駒場公園や駒場野公園の緑をめぐり、歴史の舞台を訪ねてみましょう。\n\n![駒場東大前駅](https://static.reearth.io/assets/01gd2rdjr5gh725jjd1d4r8d6e.jpg)\n●駒場東大前駅\n\n![駒場コース表紙](https://static.reearth.io/assets/01gdczhhggxa2yza60fng9vh8r.jpg)",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#6abeffff",
                outlineWidth: 3,
                size: "medium",
                title: "駒場コース Komaba Course",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcq2rtgr5n",
          pluginId: "reearth",
          extensionId: "marker",
          name: "01.駒場の今昔 Past and present of Komaba",
          propertyId: "01gensmb78npajhhmcq5bj86dh",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtesgv4nzsdkhmk7p8mzx.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.659388,
                lng: 139.681447,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![駒場野公園の雑木林](https://static.reearth.io/assets/01gbkxb60dmwgr8nwfyxkc2aab.jpg)\n●駒場野公園の雑木林\n\n目黒の地名は、一説に馬畔からきているといわれています。目黒は、はるか万葉の時代から馬の放牧が盛んなところでした。駒場一帯は台地で、かつては駒場野と呼ばれ、人の背たけほどもある笹が一面に生い茂り、所々に松林などがある原野が広がっていました。馬の放牧には格好の場所だったのです。草原を疾駆する栗毛や芦毛の駿馬の群れ。ここでたくましく育った馬は、軍馬として重用され、古代から中世にかけて東国武士たちの活躍を支える力になったそうです。\n\n## ●将軍家の鷹狩の場\n江戸に幕府を開いた徳川家康は、かつての仲間であった大大名が参勤交代で江戸に来ると、鷹狩にこと寄せて自ら大名行列を出迎えて長旅の労をねぎらうのが常でした。  \n\nこの鷹狩には、ひそかに民情を探る目的もあったといわれており、その後、特に鳥や獣の数多く生息する目黒の駒場野一帯は、将軍家の御猟場 (御鷹場 )となりました。\n\n![駒場野](https://static.reearth.io/assets/01gbkxbah2kpsd6xnxmgjm66hr.jpg)\n●駒場野 (長谷川雪旦画「江戸名所図会」1893年 国立国会図書館蔵 )部分\n\n![歌川芳虎「幕末維新錦絵集」](https://static.reearth.io/assets/01gbpfvxnt1hxea06c7zwneaqm.jpg)\n\n●駒場野之風景 (歌川芳虎「幕末維新錦絵集」 1870年 早稲田大学図書館蔵 )部分\n\n## ●農民の苦しみと駒場野一揆\n将軍の鷹狩のたびに、地元の農民たちは場所ごしらえやら、道の整備やらに駆り出されました。大事な田畑は人馬で踏み荒らされてめちゃめちゃにされ、また、鷹の好物である昆虫のケラ集めも、夜中に提灯をかざして田畑の畦を探し回るなど、それは大変な仕事でした。  \n\n御鷹場だった駒場野も、黒船来航や倒幕運動で燃えさかる慶応3年 (1867 )には、幕府の軍事訓練所の建設工事が計画されました。ところがこの計画、農民には寝耳に水のうえ、幕府から何ひとつ補償が示されなかったため、近隣の農民の怒りが爆発し、駒場野の番人の家を打ち壊すなどの抗議の末、建設そのものを中止に追い込みました。  \n\nその後、明治政府が帝国陸軍用地として買収したことを機に、駒場野一帯は一大軍事施設に変貌していきました。\n\n![歌川広重「江戸名勝図会」](https://static.reearth.io/assets/01gbkye13x4atf0b5757608bmy.jpg)\n\n●駒場野 (歌川広重「江戸名勝図会」\n国立国会図書館蔵 )\n\n## ●明治3年のハイカラ観兵式\n\n明治3年 (1870 )、わが国で初めての陸軍観兵式が駒場野で行われました。維新後、日が浅かったため、兵士の服装はまちまちで、軍事教練のスタイルもイギリス式、フランス式、ドイツ式とばらばらで、それは珍妙なものでした。  \n\nこの時、明治天皇は弱冠19歳。烏帽子直垂に緋のはかまを着け、芦毛の馬に乗って皇居から駒場野へ向かいました。沿道には大勢の見物人が詰めかけましたが、すでに新政府から「今後いっさい土下座無用」の通達が出ていたので、沿道に詰めかけた大勢の見物人は、初めて立ったまま天皇の行列を見送ったといいます。  \n\n観兵式はラッパの音を合図に始まりましたが、見物人はもちろん、兵士の中にもラッパを初めて聞く者が多く、みな目を白黒させ、号令も日本語のほかに英語、フランス語、ドイツ語などが飛びかい、意味のわからない号令に兵士たちは右往左往の連続だったようです。この時、天皇陛下が閲兵のため野立ちした場所が、今の駒場小学校の辺りといわれ、後に地元の有志が立てた記念碑が校庭に残っています。\n\n## ●駒沢練兵場\n明治30年 (1897 )、駒場野の南の位置に帝国陸軍の大練兵所が設けられました。北は現在の東山公園、南は三宿病院、さらに東は東山中学校、西は世田谷区の池尻小学校の辺り、その広さは実に13ヘクタール余りに及びました。これが目黒、世田谷の両区にまたがって広がっていた駒沢練兵場です。  \n\nやがて、この練兵場の西側一帯に野砲兵第一連隊、近衛野砲連隊、砲兵旅団司令部等が次々と建てられ、練兵場を使った軍事訓練が日夜行われるようになりました。この訓練は大変に激しいもので、兵隊も重い砲車を引く軍馬も汗まみれ、土まみれになり、いつも訓練が終わる頃には、人馬ともにへとへとに疲れ切ってしまったそうです。またあまりの猛訓練のため、春一番の強い南風が吹く頃になると、人馬が巻き上げる砂塵が家の中に大量に入り込み、きれいなのは茶筒の中だけだった、というエピソードも伝わっています。\n\n![練兵場内の一本松と警察官の住宅](https://static.reearth.io/assets/01gbkxaf73ph8ynv7exjj618a7.jpg)\n●練兵場内の一本松と警察官の住宅(1937年1月)\n\n![広大な練兵場とケヤキの大木](https://static.reearth.io/assets/01gbkxa6g4xty37sf9r8rwqj7n.jpg)\n●広大な練兵場とケヤキの大木 (1937年1月 )",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#ffa3d4ff",
                outlineWidth: 3,
                size: "medium",
                title: "01.駒場の今昔 Past and present of Komaba",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcq6rf67p9",
          pluginId: "reearth",
          extensionId: "marker",
          name: "02.東京大学 The University of Tokyo",
          propertyId: "01gensmb78npajhhmcq9bwqxnr",
          property: {
            default: {
              extrude: false,
              height: 30,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtesezpwrjqvnf951wzk8.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.660892,
                lng: 139.684119,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![東大駒場の銀杏並木](https://static.reearth.io/assets/01gbpcch69gk5r78sqb47dbm30.jpg)\n\n\n井の頭線の駒場東大前駅を降りると、すぐ目の前が東京大学駒場Iキャンパスです。広々としたキャンパスは豊かな緑に包まれ、いかにも学問の府といった風情がただよいます。  \n\n昭和10年 (1935 )、駒場の東京帝国大学農学部が本郷に転出したあと、その跡地には旧制第一高等学校が移ってきました。一高の名で親しまれたこの学校には、一高の校章のモチーフとなったオリーブが植えられています。また、「あゝ玉杯に花うけて……」の歌詞で始まる寮歌も有名です。校内には美術博物館と自然科学博物館からなる駒場博物館があり、この建物は旧制第一高等学校の図書館として建てられた由緒あるものです。\n\n## ●玉杯の碑\n当時の一高生たちは西洋かぶれのハイカラを否定し、わざわざ着古し擦り切れた学生服や破れた帽子を身につけ、外面でなく内面の重要性を表した「バンカラ」をもって任じていました。そして、声高らかに「栄華の巷低く見て……五寮の健児意気高し」と寮歌を歌ったのです。昭和31年 (1956 )、一高obの手で「嗚呼玉杯の碑」が建立されました。この碑は現在、東大駒場Iキャンパス構内にある同窓会館の裏手に立っています。また、一高の校章にデザインされている橄欖 (オリーブ )の古木が一高から移植されており、記念の石碑も残されています。\n\n![嗚呼玉杯之碑](https://static.reearth.io/assets/01gbkxax52ft60fe3yzp65q36z.jpg)\n●嗚呼玉杯之碑\n\n![駒場の公園の雑木林](https://static.reearth.io/assets/01gbkxascfdzjq1j66470phnjd.jpg)\n●構内にあるオリーブの古木",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#bea3ffff",
                outlineWidth: 3,
                size: "medium",
                title: "02.東京大学 The University of Tokyo",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcqcafa6bn",
          pluginId: "reearth",
          extensionId: "marker",
          name: "03.駒場公園 Komaba Park",
          propertyId: "01gensmb78npajhhmcqenn96ha",
          property: {
            default: {
              extrude: false,
              height: 30,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtecscg1xxsqga8h3vk9k.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.661716,
                lng: 139.68016,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![駒場公園和館から見た庭](https://static.reearth.io/assets/01gbkxamwh96q5cfpx4j0mc72d.jpg)\n\n駒場東大前駅前から緑多い閑静な住宅街を北に向うと、駒場公園があります。区立公園では二番目の広さで4ヘクタールあります。ケヤキやクス、カシなどの大木が生い茂る園内は、ひっそりと静かで、時おり野鳥がさえずり、まさに都会の中のオアシスといった感があります。平成25年 (2013 )には、公園内にある和館・洋館などが「旧前田家本邸」として国指定重要文化財 (建造物 )となりました。  \n\n公園になる前、この場所は洋風・和風2棟の屋敷が建つ旧加賀百万石の十六代当主・前田利為侯爵の邸宅でした。前田邸はもともと本郷にありましたが、大正15年 (1926 )、駒場農学校 (後の東京帝国大学農学部 )跡地の一部へ移転してきました。終戦後は連合軍に接収され、司令官の官邸として使われるなどの変遷をたどり、昭和42年 (1967 )に都立の駒場公園としてオープン、さらに同50年 (1975 )に目黒区に移管されました。公園北門の隣には、前田家の尊經閣文庫があり、前田家が所蔵する和洋の古い書籍や美術工芸品が収められていますが、一般公開はされていません。",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#adcaffff",
                outlineWidth: 3,
                size: "medium",
                title: "03.駒場公園 Komaba Park",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcqhhsdy62",
          pluginId: "reearth",
          extensionId: "marker",
          name: "03-01.日本近代文学館",
          propertyId: "01gensmb78npajhhmcqk9apq1z",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfq0ywkf2ydfxbgyr8v86wcn.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.662792,
                lng: 139.680921,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "こちらは校倉風の白い近代的な建物で、小説家で詩人でもあった高見順ら文壇・学界の有志の呼びかけで、昭和42年 (1967 )、洋館の近代文学博物館と同時にオープンしました。図書、雑誌、新聞のほか、文学資料約120万点が集められており、文字通り近代文学の殿堂といってよいでしょう。\n\n![モダンな意匠の近代文学館](https://static.reearth.io/assets/01gbpfwr3naznn3km7kggme01y.jpg)\n●モダンな意匠の近代文学館",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#adcaffff",
                outlineWidth: 3,
                size: "medium",
                title: "03-01.日本近代文学館",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcqq804vj3",
          pluginId: "reearth",
          extensionId: "marker",
          name: "03-02.旧前田家本邸・和館",
          propertyId: "01gensmb78npajhhmcqsv8psv3",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtes89dn67zjtnjyxhng3.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.662278,
                lng: 139.68075,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![庭園側から見た和館](https://static.reearth.io/assets/01gbpfw9k3w38rj5yd77g7dr3b.jpg)\n●庭園側から見た和館\n\n昭和 5年 (1930 )に完成した書院造の和館は、周りの自然とよく調和し、楚々とした中にも高い気品を漂わせています。前田家は普段はここを使わず、迎賓館として、ひな祭りや端午の節句、またお茶や和食の会などを催すときだけ使用したといいます。昭和49年 (1974 )からは1階の2部屋が無料開放され、名石珍木、池などをあしらった幽邃の奥庭を眺めながらくつろげる場となっています。水屋、待合を備えた茶室や和室は有料で利用できます。また、茶庭の手水鉢の下には、水を流すと水滴の音が琴の音のように響く水琴窟がつくられています。\n\n![秋の和館](https://static.reearth.io/assets/01gbpfw9m6cbdrffd0r7d602vv.jpg)\n●秋の和館\n\n![水琴窟](https://static.reearth.io/assets/01gbpfwr4kfmtes5z946b04cxm.jpg)\n●つくばいの下には水滴音が琴のように響く水琴窟があります",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#adcaffff",
                outlineWidth: 3,
                size: "medium",
                title: "03-02.旧前田家本邸・和館",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcqx0ccgn0",
          pluginId: "reearth",
          extensionId: "marker",
          name: "03-03.旧前田本邸・洋館",
          propertyId: "01gensmb78npajhhmcqywb8jbf",
          property: {
            default: {
              extrude: false,
              height: 20,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtesezpwrjqvnfbm4b3xq.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.662383,
                lng: 139.680149,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![駒場公園洋館前の桜](https://static.reearth.io/assets/01gbpfw9m9eq5qjw3nv18qrktd.jpg)\n●春、洋館前は桜の広場になる\n\nイギリスの王朝時代から抜け出してきたような、重厚な意匠でまとめられた落ち着いた建物が、旧前田侯爵の住まいだった洋館です。前田候は駐在武官として長くヨーロッパに滞在した経験があり、昭和4年 (1967 )に建てられたこの洋館で、外国のお客さんなどをもてなしました。  \n\n第二次世界大戦が始まると、前田候はボルネオ方面軍司令官として出征しましたが、戦没し、大黒柱を失った駒場の邸宅は引き払われました。戦後は連合軍に接収されましたが、昭和39年 (1964 )に東京都の所有になり、昭和42年 (1967 )から平成14年 (2002 )にかけては、洋館をそのまま利用した東京都近代文学博物館が設置されていました。現在、館内の一部は、一般に公開されています。詳細は東京都教育庁 (☎ 5321-1111 )にお問い合わせください。\n\n![洋館書斎](https://static.reearth.io/assets/01gbpfwr3w3jgq0g7s2k3rzrkh.jpg)\n●洋館書斎",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#adcaffff",
                outlineWidth: 3,
                size: "medium",
                title: "03-03.旧前田本邸・洋館",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcr1jmcg3p",
          pluginId: "reearth",
          extensionId: "marker",
          name: "04.民芸運動と日本民藝館 Mingei(Folk Crafts) Movement and The Japan Folk Crafts Museum",
          propertyId: "01gensmb78npajhhmcr4dgx5q8",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtesezpwrjqvnf6nge51q.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.660814,
                lng: 139.679162,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![長屋門](https://static.reearth.io/assets/01gbpfw9gyyrhameyght2pge2m.jpg)\n●長屋門の堂々たる構え\n\n観賞用の芸術品とは違い、民衆の日常生活から生まれてきた工芸品の数々。昭和の初めごろ、こうした民芸品にこそ本当の美があるとして、優れた民芸品を発掘したり、創作したりという、後の民芸運動にまで発展する大きなうねりが巻き起こりました。この運動の創始者といわれる柳宗悦は、陶芸家の濱田庄司やイギリス人の陶芸家バーナード・リーチら大勢の共鳴者によって支えられました。彼は濱田らとともに、民芸運動の拠点となる「日本民芸芸術館」の設立を提唱し、やがてこの運動が実を結び、倉敷の大原美術館をつくった大原孫三郎の財政援助などもあって、昭和11年 (1936 )、日本民藝館が誕生しました。  \n\n既に半世紀以上の年紀を重ねた日本民藝館は、大谷石を使った蔵づくりにより落ち着いた美しさを見せ、陶芸や織物など多彩な民芸品のコレクションは質・量ともに優れています。また道路を挟んで反対側には、日光街道沿いから運ばれてきた名主の家の長屋門と付属塀があり、国登録有形文化財 (建造物 )に指定されています。\n\n![日本民藝館内部](https://static.reearth.io/assets/01gbpfwr3bjfy9d903mdpqwhnr.jpg)\n●日本民藝館内部\n\n## ●民芸品のコレクション\n日本民藝館の所蔵する工芸品は、陶磁器、染・織物、木・漆・金・石・紙工、絵画、彫刻、拓本などにわたり、一万余点を数えます。\n\n![鬼の行水](https://static.reearth.io/assets/01gbpfwqze0q8fmw47h14yk4re.jpg)\n●大津絵『鬼の行水』 (17世紀後半~18世紀前半 )部分\n\n![麦藁手碗](https://static.reearth.io/assets/01gbpfwr3kpm5vfhaq3vr8qq5n.jpg)\n●麦藁手碗 (19世紀 )\n\n![蓮葉型狗足膳](https://static.reearth.io/assets/01gbpfwqz2q4bxeqmzf653788d.jpg)\n●蓮葉型狗足膳 木製漆塗 (朝鮮半島、19世紀 )\n\n![白地霞に枝垂桜雪輪文様紅型衣裳](https://static.reearth.io/assets/01gbpfwr3x8r3g0rcer09jr1jp.jpg)\n●白地霞に枝垂桜雪輪文様紅型衣裳 (沖縄、19世紀 )\n\n## ●古い歴史の板碑\n長屋門の隣には、インドの古代語である梵字が彫り込まれた、板碑と呼ばれる石の卒塔婆が立っています。板碑は、鎌倉時代以降の長い戦乱の中で、仏教を信仰する人々により、追善供養や自らの死後の安楽祈願などのために建てられた石碑です。日本民藝館の板碑は弘長2年 (1262 )に造られたもので、高さは約150センチメートルあり、目黒区内に現存する板碑の中では最古のものです。元は埼玉県の坂戸市域にあったものを、後年になって移設されたといわれています。日本民藝館では、このほかに 5基の板碑を所蔵しています。\n\n![鎌倉時代に造られた板碑](https://static.reearth.io/assets/01gbpfwr1qwht2zvgpevd9kprz.jpg)\n●鎌倉時代に造られた板碑 (左 )",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#99cca7ff",
                outlineWidth: 3,
                size: "medium",
                title:
                  "04.民芸運動と日本民藝館 Mingei(Folk Crafts) Movement and The Japan Folk Crafts Museum",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcr4g77a14",
          pluginId: "reearth",
          extensionId: "marker",
          name: "05.駒場野公園 Komabano Park",
          propertyId: "01gensmb78npajhhmcr6cbd8j7",
          property: {
            default: {
              extrude: false,
              height: 30,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxteshq2r29vydr7y07w76.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.658504,
                lng: 139.68061,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "東京教育大学 (現筑波大学 )農学部が、昭和53年 (1978 )に筑波へ移転したあと公園として整備され、昭和61年 (1986 )に開園しました。当初は2.8ヘクタールでしたが、平成20年 (2008 )には、元総務省情報通信研修所跡地を拡張・整備し、3.9ヘクタールの広さになりました。\n\n## ●近代農学発祥の地\n日本人は昔から稲作を営んできた農耕の民ですが、クラーク博士で有名な札幌の農学校と並んで、ここ駒場が近代農学発祥の地であることは、あまり知られていません。明治11年 (1878 )「駒場農学校」が誕生し、欧米から外国人教師を招いて、先進国の農業技術を学ぶ教育が始まりました。アメリカ式の農業を教育の柱とした札幌農学校に対し、もっぱらドイツ農法に範を求めた駒場農学校は、やがて大農場のほかに、園芸・植物園、家畜病院などまで備えた“農業の総合大学”に発展し、優秀な農業技術者を次々と世に送り出していきました。  \n\n駒場農学校は明治19年 (1878 )に東京農林学校になり、さらに東京帝国大学農学部、東京教育大学農学部等と形を変えながら、昭和53年 (1978 )、教育大農学部が筑波に移転するまで、この地で農業教育の灯を燃やし続けました。今、これを記念した大きな「駒場農学碑」が東京大学駒場Iキャンパスの構内に立っています。\n\n![駒場農学碑](https://static.reearth.io/assets/01gbpc36aa92atw60dyce04arp.jpg)\n●駒場農学碑\n\n## ●老農・船津伝次平\n駒場農学校の教師の中に、船津伝次平という一人の日本人がいました。群馬県の赤城山麓で優れた農業指導者として知られていた伝次平は、時の内務卿・大久保利通のすすめで、開校したばかりの駒場農学校で教鞭をとることになりました。この時、彼は既に46歳。講義のかたわら、学生たちと一緒に開墾のクワを振るって実習田をつくりあげたといわれます。彼が学生たちに教えたのは、経験を重んじる在来の日本農業に西洋の近代農法を積極的に採り入れた「混同農事」といわれるもので、その後、この農法は全国に普及していきました。こうした功績により、伝次平は後に「明治三老農」の一人に数えられています。\n\n![上毛かるたに描かれた船津伝次平](https://static.reearth.io/assets/01gbpfx18xcmsjpqxkvn22f0ge.jpg)\n●上毛かるたに描かれた船津伝次平\n\n![中高生による田植え](https://static.reearth.io/assets/01gbpc369jw94mmh4bcjzf7ge7.jpg)\n●中高生による田植え\n\n![駒場野まつりの｢かかしコンクール」](https://static.reearth.io/assets/01gbpc369grb05kwn4j2m754rj.jpg)\n●駒場野まつりの｢かかしコンクール」\n\n## ●武蔵野のいきものたち\n武蔵野の雑木林を今に伝える駒場野公園には、素敵ないきものたちが住んでいます。これらのいきものたちを守り育てるには、雑木林や里山に特有の管理が必要です。\n\n![水田のオニヤンマ](https://static.reearth.io/assets/01gbpc367g9e8fmps0hze39x0e.jpg)\n●水田のオニヤンマ\n\n![地域活動のシンボルのヘイケボタル](https://static.reearth.io/assets/01gbpc3632b48b5j9knfah1zd8.jpg)\n●地域活動のシンボルのヘイケボタル\n\n![ジョウビタキのオス](https://static.reearth.io/assets/01gbpc35ttzq8qj8b5hd5n1ngg.jpg)\n●ジョウビタキのオス\n\n![人気者のアマガエル](https://static.reearth.io/assets/01gbpc3631mfqa2fr1vywk6npq.jpg)\n●人気者のアマガエル\n\n![ウメの蜜を吸いにきたメジロ](https://static.reearth.io/assets/01gbpc365gr2kzrpxnsmmmkp29.jpg)\n●ウメの蜜を吸いにきたメジロ\n\n![美しい花色のタチツボスミレ](https://static.reearth.io/assets/01gbpfw9g6mqm6mkt63ewnta69.jpg)\n●美しい花色のタチツボスミレ\n\n![宝石のようなタマムシ](https://static.reearth.io/assets/01gbpc366v29cd856q9g67wxta.jpg)\n●宝石のようなタマムシ\n\n## ●身近な自然を学べる観察舎\n\n![自然観察舎の楽しい展示](https://static.reearth.io/assets/01gbpfw9ejd8ebv6zk52xrb8xg.jpg)\n●自然観察舎の楽しい展示\n\n![自然観察舎の外観](https://static.reearth.io/assets/01gbpfw9gfhrkmhq4t9ae5hk08.jpg)\n●自然観察舎の外観\n\n公園の自然を観察しながら管理を行なう活動や、ホタルの棲める環境づくりを目指す活動などのボランティアの活動拠点として、駒場野公園内には自然観察舎 (☎ 3485-1754 )があります。また、拡張部には管理棟があり、公園の自然やいきもの、雑木林の管理などについて紹介・展示しています。",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#f3ec4cff",
                outlineWidth: 3,
                size: "medium",
                title: "05.駒場野公園 Komabano Park",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcr89vh29w",
          pluginId: "reearth",
          extensionId: "marker",
          name: "05-01.ケルネル田圃",
          propertyId: "01gensmb78npajhhmcr8s4hm2d",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxterxcv966hxk5t7bjga2.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.658865,
                lng: 139.680755,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![ケルネル田んぼと井の頭線](https://static.reearth.io/assets/01gbpfw9m8e73qpyyxrc3yetem.jpg)\n●ケルネル田んぼと井の頭線\n\n明治14年 (1881 )、駒場農学校に気鋭のドイツ人講師が赴任して来ます。彼の名はオスカー・ケルネル。ケルネルは我が国で初めて化学肥料の使用を試み、日本近代農学の発展に貢献しました。研究熱心な彼は、船津伝次平らがこしらえた実習田を使って、土壌や肥料の改良に取り組みました。これが日本初の実験水田といわれ、今も「ケルネル田圃」として、井の頭線と駒場野公園の間の低地に残っています。この田圃は、目黒区内に残された唯一の水田で、非常に貴重なものです。毎年、筑波大学附属駒場中学校・高等学校の生徒たちが、米づくりの体験学習をしながら保存に務めています。\n\n\n![オスカー・ケルネル](https://static.reearth.io/assets/01gbpc367nzfg3tzchpn1062d9.jpg)\n●オスカー・ケルネル",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#f3ec4cff",
                outlineWidth: 3,
                size: "medium",
                title: "05-01.ケルネル田圃",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcrcexxywc",
          pluginId: "reearth",
          extensionId: "marker",
          name: "05-02.駒場野公園拡張部",
          propertyId: "01gensmb78npajhhmcrdrqrxp4",
          property: {
            default: {
              extrude: false,
              height: 30,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtesp9e3nn8d9gs305353.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.656045,
                lng: 139.681807,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![公園内でのボランティア活動の様子](https://static.reearth.io/assets/01gbpfw9g07bb8b6rcssczg2x3.jpg)\n●公園内でのボランティア活動の様子\n\n元は総務省情報通信研修所の敷地でしたが、研修所が国分寺に移転後、約1ヘクタールの跡地を目黒区が購入し、平成20年 (2008 )に駒場野公園の拡張部として開園しました。この公園は近隣住民と共に計画を進め、いきものの生息場所や人が安らげる場所として樹林を設けたほか、広場や花壇に囲まれたベンチ、親子で楽しめる遊び場など、地域の声を活かした明るい公園となっています。また、この付近は「土器塚遺跡」内にあり、公園整備の際には土器などが発掘されました。\n\n![公園整備時に出土した土器など](https://static.reearth.io/assets/01gbpfx184vnjrh3sfc12dzn6z.jpg)\n●公園整備時に出土した土器など\n\n![埋まっていた状態](https://static.reearth.io/assets/01gbpfx18ybz18rec8z8b1cf3v.jpg)\n●埋まっていた状態",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#f3ec4cff",
                outlineWidth: 3,
                size: "medium",
                title: "05-02.駒場野公園拡張部",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcrhn9erk4",
          pluginId: "reearth",
          extensionId: "marker",
          name: "06.〆切地蔵 Shimekiri Jizo (stone image of Jizo)",
          propertyId: "01gensmb78npajhhmcrm8hds7a",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtes1f8scjy9vzsyygn31.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.655657,
                lng: 139.68142,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![しめきり地蔵](https://static.reearth.io/assets/01gbpcchb4kmys55jx05sjet07.jpg)\n\n駒場野公園前の淡島通りの路端に仲良く並んだ3体のお地蔵さんは〆切地蔵と呼ばれ、優しい顔で毎日、道行く人を見守っています。  \n\nその昔、隣村で悪病がはやり、大勢の人が亡くなりました。驚いた村人が、お地蔵さんに必死で祈ったところ、駒場村では誰ひとり病気にかからなかったのです。それ以来、悪病を締め出してしまう、ありがたいお地蔵さんとして、〆切地蔵の名がついたといいます。尊像は中央と右が地蔵菩薩、左は聖観音菩薩となっています。\n\n## ●御用屋敷と軍隊が駐屯した町\n\n八代将軍・徳川吉宗は鷹狩を好み、駒場野の御鷹場を管理するため、享保3年 (1718 )、今の大橋二丁目のあたりに御用屋敷を設けました。18ヘクタールもある御用屋敷には立派な御成門や、将軍の休息所、鳥見役の家などがありました。鳥見役は御鷹場の見張りのほか、周辺の村々を探る任務も持っており、彼らが常駐する御用屋敷は、幕府の地域支配の拠点でもあったようです。また後の調査では、薬用の植物を栽培する御薬園や、空堀などが発見されています。  \n\n明治以降は富国強兵政策により陸軍の施設が次々とでき、終戦まではさながら軍都の感がありました。当時、この界隈には、兵隊相手に水筒、靴、肩章などを売る「員数屋」と呼ばれる店が並びました。旧軍隊では、官給品を紛失したら厳罰もの。そのため、兵隊たちは員数屋で失くした品物を買い求め、員数合わせをしたといいます。「員数屋」も戦後は古道具屋などに変わりましたが、道路拡張に伴う立ち退きで、やがて姿を消してしまいました。\n\n## ●ネオゴシック建築を訪ねる\n\n駒場エリアは、建築家・内田祥三設計により昭和初期に建てられたネオゴシック建築物をはじめとする歴史的遺産の宝庫です！ここでは、その内のいくつかを紹介します。\n\n![国登録有形文化財 (建造物 )の旧第一高等学校本館 (時計台 )](https://static.reearth.io/assets/01gbpcchctxxcw2nmsnrann2nx.jpg)\n●国登録有形文化財 (建造物 )の旧第一高等学校本館 (時計台 )昭和８年 (1933 )完成\n\n![東京大学駒場博物館(駒場Ⅰキャンパス)](https://static.reearth.io/assets/01gbpcchaxjxene6xg64ax0etb.jpg)\n●東京大学駒場博物館(駒場Ⅰキャンパス) 昭和10年(1935)完成\n\n![装飾を施した101号館(駒場Ⅰキャンパス)](https://static.reearth.io/assets/01gbpcchcwdc2gaxsfag3s5031.jpg)\n●装飾を施した101号館(駒場Ⅰキャンパス) 昭和10年(1935)完成\n\n![駒場博物館の内部](https://static.reearth.io/assets/01gbpfx17zwh7xgyxnjnwed04m.jpg)\n●駒場博物館の内部\n\n![●国登録有形文化財 (建造物 )の旧東京帝国大学航空研究所本館(駒場Ⅱキャンパス)](https://static.reearth.io/assets/01gbpcchavtf7qcv08s5068qwv.jpg)\n●国登録有形文化財 (建造物 )の旧東京帝国大学航空研究所本館(駒場Ⅱキャンパス) 昭和６年(1931)完成\n\n## ●バラ香るまち、駒場\n明治44年 (1911 )に駒場に開園した、バラ屋さんのバラを引き継いで活かした地域の活動が始まり、駒場公園や駒場小学校、東京大学などにバラ花壇が誕生しました。美しいバラをめぐってみましょう。\n\n![東大正門脇の「バラの小径」](https://static.reearth.io/assets/01gbpcchd2aysr8pf2e3c3rmhv.jpg)\n●東大正門脇の「バラの小径」",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#f3a84cff",
                outlineWidth: 3,
                size: "medium",
                title: "06.〆切地蔵 Shimekiri Jizo (stone image of Jizo)",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcrqve3kvt",
          pluginId: "reearth",
          extensionId: "marker",
          name: "07.氷川神社 Hikawa Shrine",
          propertyId: "01gensmb78npajhhmcrr61zm06",
          property: {
            default: {
              extrude: false,
              height: 10,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxteshq2r29vydr4xnfar0.png",
              imageShadowBlur: 0,
              imageSize: 0.25,
              label: false,
              location: {
                lat: 35.652872,
                lng: 139.688153,
              },
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![旧大山街道(国道246号)を行く神輿](https://static.reearth.io/assets/01gbpfvxp3r616h9yx29a3namq.jpg)\n●旧大山街道(国道246号)を行く神輿\n\n八岐大蛇を退治した神話で知られる素盞嗚命、天照大神、菅原道真が祀られ、鎮守様として昔から地元の人たちに崇められてきました。  \n\nこの神社は、甲斐 (山梨県 )武田家の重臣であった加藤氏の子孫が16世紀末に目黒に移り住み、郷里の産土神をこの地に迎えて、祀ったのが始まり、とされています。神社とゆかりのある加藤氏は、代々この辺りの名主をつとめ、駒場の歴史を語る際には忘れてならない旧家の一つです。\n\n![主な行事リスト](https://static.reearth.io/assets/01ge11xrc0zjtyppstv02rrw41.jpg)\n主な行事リスト\n\n![玉川通りに面した鳥居](https://static.reearth.io/assets/01gbpfvxnmy3gwhsddb0bcmed5.jpg)\n●玉川通りに面した鳥居\n\n![夏祭りの日](https://static.reearth.io/assets/01gbpfvxny5ym9q658x65wbw69.jpg)\n●夏祭りの日\n\n## ●目黒富士\n目切坂の上にあった「元富士」は明治11年 (1878 )になくなりましたが、当時の石のほこらや富士講の碑などは氷川神社に移され昭和52年 (1977 )、江戸時代に流行した「ミニ富士」が復活しました。神社の南側斜面には登山道、一合目、二合目などの標識、山頂部の境内には浅間神社があります。昔の元富士にちなんで、「目黒富士」の名がつけられていますが、残念ながら、今はここから本物の富士山は望むことはできません。\n\n![坂再建供養塔 (左 )と大山道の道標 (右 )](https://static.reearth.io/assets/01gbpfvxkjn0cbtacrscx0tyyb.jpg)\n●坂再建供養塔 (左 )と大山道の道標 (右 )\n\n![4合目から5合目を登る](https://static.reearth.io/assets/01gbpfvxp1g1wswpnhgdb9vmne.jpg)\n●4合目から5合目を登る\n\n![国道沿いの登り口にある小さな富士山](https://static.reearth.io/assets/01gbpfvxkrfg1h4xmf5kq6qnxh.jpg)\n●国道沿いの登り口にある小さな富士山\n\n氷川神社の石段の脇には、ひっそりと立つ高さ1メートルほどの石の道標があります。風化し始めた石の碑面には「大山道」の文字が刻まれています。今は国道246号、あるいは玉川通りと名を変え、車の行き来が激しい神社前の道は、江戸時代には大山街道と呼ばれ、重要な交通・輸送ルートの一つでした。  \n\nこの道は、江戸の赤坂御門を起点に、多摩川を渡り、遠く厚木、大山のふもとの伊勢原、秦野を経て、足柄峠の先へと延びていきます。そして、この道は何より雨乞いや五穀豊穣、商売繁盛の神様として、広く江戸の庶民の信仰を集めた阿夫利神社がある「大山」への参詣の道であり、金剛杖を手にした白装束の老若男女たちが、次々と通り過ぎていったのです。また、「大山道」の道標の前に、明治38年 (1905 )に行われた神社の石段改修を記念する「坂再建供養塔」が立っていますが、この石碑の右下には「武州荏原郡古菅苅庄目黒郷」という、かつてのこの一帯の地名が刻まれています。―名厚木街道。",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#ffaea3ff",
                outlineWidth: 3,
                size: "medium",
                title: "07.氷川神社 Hikawa Shrine",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
        {
          id: "01gensmb78npajhhmcrtjk16af",
          pluginId: "reearth",
          extensionId: "marker",
          name: "池尻大橋駅",
          propertyId: "01gensmb78npajhhmcrwm5pamr",
          property: {
            default: {
              extrude: true,
              height: 30,
              heightReference: "relative",
              image: "https://static.reearth.io/assets/01gfpxtes461cmqhje5twpnqgt.png",
              imageShadowBlur: 0,
              imageSize: 0.3,
              label: false,
              labelText: "池尻大橋駅",
              labelTypography: {
                fontFamily: "YuGothic",
                fontWeight: null,
                fontSize: null,
                color: null,
                textAlign: null,
                bold: null,
                italic: null,
                underline: null,
              },
              location: {
                lat: 35.650675,
                lng: 139.684542,
              },
              pointSize: 100,
              style: "image",
            },
          },
          infobox: {
            fields: [
              {
                id: "01gensq68hdxj5j4ysddtn5dpy",
                pluginId: "reearth",
                extensionId: "textblock",
                property: {
                  default: {
                    markdown: true,
                    text: "![池尻大橋駅](https://static.reearth.io/assets/01gd2s6v0879w2535nzkdsec8p.jpg)\n●池尻大橋駅",
                  },
                },
              },
            ],
            property: {
              default: {
                bgcolor: "#ffffffcc",
                outlineColor: "#6abeffff",
                outlineWidth: 3,
                size: "medium",
                title: "池尻大橋駅",
                typography: {
                  fontFamily: null,
                  fontWeight: null,
                  fontSize: null,
                  color: "#4d4d4dff",
                  textAlign: null,
                  bold: null,
                  italic: null,
                  underline: null,
                },
              },
            },
          },
          isVisible: true,
        },
      ],
    },
  ],
  widgets: [
    {
      id: "01gf5zycv20xdvg8cp1vafwzab",
      pluginId: "reearth",
      extensionId: "splashscreen",
      property: {
        camera: [
          {
            cameraDelay: 2,
            cameraDuration: 5,
            cameraPosition: {
              lat: 33.570303994660854,
              lng: 138.85195744937758,
              altitude: 4581396.213677434,
              heading: 6.283185307179585,
              pitch: -1.5684750388897593,
              roll: 0,
              fov: 1.0471975511965976,
            },
            id: "01gfja3wbmxb44fs49tfgnqeba",
          },
          {
            cameraDelay: 2,
            cameraDuration: 5,
            cameraPosition: {
              lat: 35.6260223257516,
              lng: 139.68522312578355,
              altitude: 9494.238316190766,
              heading: 5.9166661642607465,
              pitch: -1.4835298641951842,
              roll: 1.865174681370263e-14,
              fov: 1.0471975511965976,
            },
            id: "01gfqgww2qt0dk37swhdwbyhqf",
          },
          {
            cameraDelay: 1,
            cameraDuration: 4,
            cameraPosition: {
              lat: 35.64815714221762,
              lng: 139.69187857732237,
              altitude: 844.9323591907362,
              heading: 5.65063693982133,
              pitch: -0.6078457023387278,
              roll: 0.005248256797614204,
              fov: 1.0471975511965976,
            },
            id: "01gfhp2f8vq3xf1v11fek9380a",
          },
        ],
        overlay: {
          overlayDelay: 3,
          overlayEnabled: true,
          overlayImage: "https://static.reearth.io/assets/01gfn3085r46360ysvqf88xywk.png",
        },
      },
      extended: false,
    },
    {
      id: "01gf5zzt9gcevgtd03bwtn9829",
      pluginId: "reearth",
      extensionId: "storytelling",
      property: {
        default: {
          range: 300,
        },
        stories: [
          {
            id: "01gf600qqsfah5pk3vxjegsaqy",
            layer: "01gensmb78npajhhmcq0dqz25x",
            layerCamera: {
              lat: 35.65782880299194,
              lng: 139.68625699836963,
              altitude: 152.2335299234731,
              heading: 5.392526338757008,
              pitch: -0.23124749875721995,
              roll: 2.5178188423069514e-9,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxpcmwg9x",
            layer: "01gensmb78npajhhmcq2rtgr5n",
            layerCamera: {
              lat: 35.65841289867423,
              lng: 139.68251185627372,
              altitude: 113.96781480034984,
              heading: 5.704875678207019,
              pitch: -0.17774687248222687,
              roll: 6.251557120337497,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxqsgpvc9",
            layer: "01gensmb78npajhhmcq6rf67p9",
            layerCamera: {
              lat: 35.659546658754174,
              lng: 139.6873246190498,
              altitude: 213.70887011582442,
              heading: 5.4026727332825635,
              pitch: -0.31178099899786593,
              roll: 0.005986562208414092,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxram793s",
            layer: "01gensmb78npajhhmcqcafa6bn",
            layerCamera: {
              lat: 35.66438366826041,
              lng: 139.68010012560282,
              altitude: 214.11701235461857,
              heading: 3.130125840421406,
              pitch: -0.45146431451658975,
              roll: 6.2831853071401245,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxs7gbh82",
            layer: "01gensmb78npajhhmcqhhsdy62",
            layerCamera: {
              lat: 35.66346566807673,
              lng: 139.68071082519185,
              altitude: 123.1560106801976,
              heading: 2.972417889103817,
              pitch: -0.33009416934641855,
              roll: 6.283185305905738,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxvbdqdfd",
            layer: "01gensmb78npajhhmcqq804vj3",
            layerCamera: {
              lat: 35.663103046198415,
              lng: 139.68056215403837,
              altitude: 171.49881666537092,
              heading: 2.972417892347173,
              pitch: -0.6791599587920643,
              roll: 6.283185299039727,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxvncp49h",
            layer: "01gensmb78npajhhmcqx0ccgn0",
            layerCamera: {
              lat: 35.663374151022076,
              lng: 139.6804296941904,
              altitude: 145.21534836921842,
              heading: 3.3206110746581103,
              pitch: -0.32032028299386583,
              roll: 2.5356632349371466e-9,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxw05d0yw",
            layer: "01gensmb78npajhhmcr1jmcg3p",
            layerCamera: {
              lat: 35.66134490493562,
              lng: 139.67889047190712,
              altitude: 139.42496042726992,
              heading: 2.729520417193931,
              pitch: -0.5240176546187758,
              roll: 6.283185301103092,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxwys4245",
            layer: "01gensmb78npajhhmcr4g77a14",
            layerCamera: {
              lat: 35.6598909657385,
              lng: 139.6800267166118,
              altitude: 191.63769083151288,
              heading: 2.88289545772806,
              pitch: -0.5070691333661861,
              roll: 6.283185302425621,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxxj87p7x",
            layer: "01gensmb78npajhhmcr89vh29w",
            layerCamera: {
              lat: 35.65979241981921,
              lng: 139.68026723161532,
              altitude: 158.8455588268985,
              heading: 2.8828954561765565,
              pitch: -0.5070691439202895,
              roll: 6.283185305620535,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxyrsrcs3",
            layer: "01gensmb78npajhhmcrcexxywc",
            layerCamera: {
              lat: 35.65755150385493,
              lng: 139.68115953495138,
              altitude: 159.56180039702403,
              heading: 2.818026075016705,
              pitch: -0.3743730376214629,
              roll: 6.283185275857509,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vxztpb38m",
            layer: "01gensmb78npajhhmcrhn9erk4",
            layerCamera: {
              lat: 35.656142416905126,
              lng: 139.6805945163036,
              altitude: 114.8048049857929,
              heading: 2.2769739968867357,
              pitch: -0.2871066602535073,
              roll: 6.283185302441946,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vy2m31zkt",
            layer: "01gensmb78npajhhmcrqve3kvt",
            layerCamera: {
              lat: 35.65336312502022,
              lng: 139.68850985722156,
              altitude: 107.74841071597092,
              heading: 3.70814398186181,
              pitch: -0.3743731218400266,
              roll: 6.283185232014935,
              fov: 1.0471975511965976,
            },
          },
          {
            id: "01gf600qqsfah5pk3vy32qd6bq",
            layer: "01gensmb78npajhhmcrtjk16af",
            layerCamera: {
              lat: 35.6481552982794,
              lng: 139.6854604097531,
              altitude: 246.2163586434047,
              heading: 6.256324689859237,
              pitch: -0.3743731187605521,
              roll: 2.5871381481579192e-8,
              fov: 1.0471975511965976,
            },
          },
        ],
      },
      extended: false,
    },
  ],
  widgetAlignSystem: {
    inner: null,
    outer: {
      left: {
        top: null,
        middle: null,
        bottom: {
          widgetIds: ["01gf5zzt9gcevgtd03bwtn9829"],
          align: "start",
        },
      },
      center: null,
      right: null,
    },
  },
  tags: [],
  clusters: [],
};
